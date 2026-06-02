import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pool from './db.js';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const secret_key = process.env.SECRET_KEY

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Acceso denegado. No hay token.' });
    }

    jwt.verify(token, secret_key, (error, decodedUser) => {
        if (error) {
            return res.status(403).json({ success: false, message: 'Token inválido o caducado.' });
        }

        req.user = decodedUser;

        next();
    });
};

app.get('/', (req, res) => {
    res.send('El servidor de StayIn está funcionando.');
});

app.post('/api/register', async (req, res) => {
    const userData = req.body;
    
    // 1. Encriptamos la contraseña
    const encryptedPasswd = await bcrypt.hash(userData.password, 10);

    console.log('Nuevo registro en la aplicación:');
    console.log(userData);

    if(userData.rol === 'inquilino') {
        userData.rol = 'Inquilino';
    } else if(userData.rol === 'casero') {
        userData.rol = 'Casero';
    } else if(userData.rol === 'administrador') {
        userData.rol = 'Administrador';
    }

    // 2. Pedimos un trabajador a la base de datos
    const client = await pool.connect();

    try {
        // 3. Abrimos la transacción
        await client.query('BEGIN');

        // 4. Inserción principal
        const resultado = await client.query(`
            INSERT INTO Usuarios (username, email, nombre, apellidos, rol, passwd, f_nac, sexo)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING id_usuario;
        `, [
            userData.username, 
            userData.email, 
            userData.name,
            userData.apellidos, 
            userData.rol, 
            encryptedPasswd, 
            userData.birth_date, 
            userData.gender
        ]);

        // Atrapamos el ID generado
        const id_usuario = resultado.rows[0].id_usuario;
             
        // 5. Bifurcación: Inserciones secundarias
        if(userData.rol === 'Inquilino') {
            await client.query(`
                INSERT INTO Inquilino (id_inquilino) 
                VALUES ($1);
            `, [id_usuario]);
        }
        
        if(userData.rol === 'Casero') {
            await client.query(`
                INSERT INTO Caseros (id_casero) 
                VALUES ($1);
            `, [id_usuario]);
        }

        // 6. ¡Éxito! Guardamos los cambios definitivamente
        await client.query('COMMIT');
        
        res.status(200).json({
            success: true,
            message: 'Usuario guardado correctamente en la base de datos'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error durante la inserción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar el usuario'
        });
    } finally {
        // 7. Devolvemos el trabajador al Pool
        client.release();
    }
});

app.post('/api/login', async(req, res) => {
    const loginData = req.body;

    const client = await pool.connect();

    try {
        const resultado = await client.query(`
            SELECT id_usuario, passwd, rol FROM Usuarios WHERE username=$1
            OR email=$1 OR numero_tlf=$1`, [
            loginData.userName
        ]);
        if(resultado.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'El usuario no existe'
            });            
        }

        const usuario = resultado.rows[0];

        if(await bcrypt.compare(loginData.password, usuario.passwd)) {
            const token = jwt.sign({id_usuario: usuario.id_usuario, rol: usuario.rol}, secret_key, {expiresIn: '7d'});
            res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso',
                userData: {
                    id_usuario: usuario.id_usuario,
                    rol: usuario.rol,
                    token: token
                }
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Contraseña incorrecta'
            });
        }

    } catch(error) {
        console.error('Error durante el login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    } finally {
        client.release();
    }
});

app.post('/api/home/casero', verificarToken, async(req, res) => {
    const casero = req.body;

    const client = await pool.connect();

    try {

        const id_casero = req.user.id_usuario; //Viene del token del user

        const resultado = await client.query(`SELECT DISTINCT a.*, v.*
                                            FROM Viviendas v
                                            JOIN Anuncios a ON v.id_vivienda = a.id_vivienda
                                            WHERE a.id_casero = $1;`, [id_casero]);
        if(resultado.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'El usuario no tiene anuncios publicados',
                adData: []
            });
        };

        const respuesta_id_estancia = await client.query(`
            SELECT e.id_estancia 
                FROM Estancias e
                JOIN Viviendas v ON e.id_vivienda = v.id_vivienda
                LEFT JOIN Valoraciones val ON e.id_estancia = val.id_estancia AND val.id_valorador = $1
                WHERE 
                    (e.id_inquilino = $1 OR v.id_casero = $1) 
                    AND e.f_fin_estancia IS NOT NULL
                    AND val.id_valoracion IS NULL;`, [id_casero]);

        const valoraciones_pendientes = respuesta_id_estancia.rows.map(fila => fila.id_estancia);
        
        res.status(200).json({
            success: true,
            message: 'El usuario tiene anuncios publicados',
            adData: resultado.rows,
            valoraciones_pendientes: valoraciones_pendientes
        });
        
        

    } catch(error) {
        console.error('Error al cargar anuncios del casero:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los datos del casero'
        });
    } finally {
        client.release();
    }
});

app.post('/api/postad', verificarToken, async(req, res) => {
    console.log("¡PETICIÓN RECIBIDA EN POSTAD!"); // Añade esta línea
    console.log("Datos:", req.body);

    const adData = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN;');

        const userResult = await client.query(`SELECT id_usuario FROM Usuarios WHERE username=$1`, [adData.userName]);
        const id_casero = userResult.rows[0].id_usuario;

        const viviendaResult = await client.query(`INSERT INTO Viviendas(id_casero, area, direccion,  max_inquilinos, 
                            numero, puerta, cpostal) VALUES($1, $2, $3, $4, $5, $6, $7)
                            RETURNING id_vivienda;`, [
                                id_casero,adData.area, adData.direccion, adData.max_inquilinos,
                                adData.numero, adData.puerta, adData.cp
                            ]);

        const id_vivienda = viviendaResult.rows[0].id_vivienda;

        await client.query(`INSERT INTO Anuncios(id_vivienda, id_casero, titulo, img,
                            descripcion, precio, multimedia) VALUES($1, $2, $3, $4, $5, $6, $7)`, [
                                id_vivienda, id_casero, adData.title, adData.portada, adData.descripcion,
                                adData.precio, adData.multimedia
                            ]);

        await client.query(`COMMIT`);
        res.status(200).json({
            success: true,
            message: 'Anuncio creado correctamente'
        })
    } catch(error) {
        await client.query('ROLLBACK');
        console.error('Error durante la inserción del anuncio:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el anuncio'
        });
    } finally {
        client.release();
    }
});

app.post('/api/editad', verificarToken, async(req, res) => {
    const adData = req.body;

    if(!adData.id_anuncio) {
        return res.status(400).json({ success: false, message: 'Falta el ID del anuncio' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN;');

        const updateAnuncio = await client.query(`
            UPDATE Anuncios SET titulo = $1, precio = $2
            WHERE id_anuncio= $3 RETURNING id_vivienda;
            `, [adData.title, adData.precio, adData.id_anuncio]);

        const id_vivienda = updateAnuncio.rows[0].id_vivienda;

        await client.query(`
            UPDATE Viviendas SET area = $1, direccion = $2, max_inquilinos = $3,
            descripcion = $4 WHERE id_vivienda = $5
            `, [adData.area, adData.direccion, adData.max_inquilinos, adData.descripcion, id_vivienda
            ]);
        
            await client.query('COMMIT;');

            res.status(200).json({
                success: true,
                message: 'Anuncio editado correctamente'
            });

    } catch(error) {
        console.log('Error al editar el anuncio');
        console.error('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al actualizar'
        });
    } finally {
        client.release();
    }
});

app.post('/api/home/inquilino', verificarToken, async (req, res) => {
    const adData =req.body;

    const client = await pool.connect();

    try {

        const id_inquilino = req.user.id_usuario; //Viene del token del user

        const resultadoAnuncios = await client.query(`
                SELECT 
                    a.*, 
                    v.*,
                    EXISTS (
                        SELECT 1 
                        FROM Interacciones_Anuncios i 
                        WHERE i.id_anuncio = a.id_anuncio 
                        AND i.id_inquilino = $1 
                        AND i.tipo_interaccion = 'favoritos'
                    ) AS es_favorito
                FROM Viviendas v
                JOIN Anuncios a ON v.id_vivienda = a.id_vivienda
                ORDER BY es_favorito DESC;
            `,
                [id_inquilino]
        );

        // const resultadoCompaneros = await client.query(`
        //         SELECT
        //             i.descripcion,
        //             u.nombre, u.apellidos, u.username, u.img_perfil,
        //             p.zona
        //         FROM Usuarios u 
        //         JOIN Inquilino i ON u.id_usuario = i.id_inquilino
        //         JOIN Preferencias_Inquilinos p ON p.id_inquilino = u.id_usuario
        //         WHERE u.id_usuario != $1 && zona && $2


        //     `,
        //     [id_inquilino, zona]
        // );

        const respuesta_id_estancia = await client.query(`
            SELECT e.id_estancia 
                FROM Estancias e
                JOIN Viviendas v ON e.id_vivienda = v.id_vivienda
                LEFT JOIN Valoraciones val ON e.id_estancia = val.id_estancia AND val.id_valorador = $1
                WHERE 
                    (e.id_inquilino = $1 OR v.id_casero = $1) 
                    AND e.f_fin_estancia IS NOT NULL
                    AND val.id_valoracion IS NULL;`, [id_casero]);

        const valoraciones_pendientes = respuesta_id_estancia.rows.map(fila => fila.id_estancia);

        if(resultado.rows.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No hay anuncios publicados',
                adData: [],
                valoraciones_pendientes: valoraciones_pendientes
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Hay anuncios publicados',
            adData: resultadoAnuncios.rows,
            valoraciones_pendientes: valoraciones_pendientes
        });
        
        

    } catch(error) {
        console.error('Error al cargar anuncios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los datos'
        });
    } finally {
        client.release();
    }
});

app.post('/api/solicitudes/crear', verificarToken, async (req, res) => {
    const solicitud = req.body

    const id_usuario = req.user.id_usuario;

    const client = await pool.connect();

    try {
        await client.query('BEGIN;');

        const solicitudCreada = await client.query(`
            INSERT INTO Solicitudes(id_anuncio, id_inquilino) VALUES ($1, $2);
            `, [solicitud.id_anuncio, id_usuario]);

        await client.query('COMMIT;');

        res.status(200).json({
            success: true,
            message: 'Solicitud creada correctamente'
        });

    } catch(error) {
        if (error.code === '23505') {
            return res.status(400).json({ success: false, message: 'Ya has enviado una solicitud para este anuncio' });
        }
        console.error('Error al crear la solicitud: ', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear solicitud del inquilino'
        });
    } finally {
        client.release();
    }
});

app.post('/api/solicitudes/casero', verificarToken, async(req, res) => {
    const id_casero = req.user.id_usuario;

    console.log('El id del casero es: ', id_casero);

    const client = await pool.connect();

    try {
        const resultado_solicitudes = await client.query(`
            SELECT 
                s.id_solicitud,
                s.id_anuncio, 
                s.f_solicitud,
                u.username,
                a.titulo AS titulo_anuncio
                FROM Solicitudes s
                JOIN Anuncios a ON s.id_anuncio = a.id_anuncio
                JOIN Usuarios u ON s.id_inquilino = u.id_usuario
                WHERE a.id_casero = $1 AND s.estado = 'Pendiente'
                ORDER BY s.f_solicitud DESC;`, 
                [id_casero]);

        const resultado_valoraciones = await client.query(`
            SELECT 
                e.id_estancia,
                e.f_fin_estancia,
                a.titulo AS titulo_anuncio,
                u.img_perfil,
                u.id_usuario AS id_usuario_a_valorar,
                u.username AS usuario_a_valorar,
                CASE 
                    WHEN e.id_inquilino = $1 THEN v.id_casero 
                    ELSE e.id_inquilino 
                END AS id_valorado
            FROM Estancias e
            JOIN Viviendas v ON e.id_vivienda = v.id_vivienda
            JOIN Anuncios a ON v.id_vivienda = a.id_vivienda
            JOIN Usuarios u ON u.id_usuario = (
                CASE 
                    WHEN e.id_inquilino = $1 THEN v.id_casero 
                    ELSE e.id_inquilino 
                END
            )
            LEFT JOIN Valoraciones val ON e.id_estancia = val.id_estancia AND val.id_valorador = $1
            WHERE 
                (e.id_inquilino = $1 OR v.id_casero = $1) 
                AND e.f_fin_estancia IS NOT NULL
                AND val.id_valoracion IS NULL;`, 
            [id_casero]);

        res.status(200).json({
            success: true,
            message: 'Se han enviado las solicitudes con éxito',
            solicitudes: resultado_solicitudes.rows,
            valoraciones: resultado_valoraciones.rows
        });
    } catch(error) {
        console.error('Error al mostrar las solicitudes del usuario: ', error);
        res.status(500).json({
            success: false,
            message: 'No se han podido mostrar las solicitudes del usuario'
        });
    } finally {
        await client.release();
    }
});

app.post('/api/solicitudes/procesar', verificarToken, async (req, res) => {
    const id_casero = req.user.id_usuario;
    const accepts = req.body.accepts;
    const userName = req.body.userName;
    const id_anuncio = req.body.id_anuncio;

    console.log('El id del anuncio es: ', id_anuncio);

    const client = await pool.connect();

    try {
        await client.query('BEGIN;');

        const respuesta = await client.query(`
            SELECT 
                i.id_inquilino FROM Inquilino i JOIN Usuarios u ON i.id_inquilino = u.id_usuario
                WHERE u.username = $1`, [userName]);

        const id_inquilino = respuesta.rows[0].id_inquilino;

        const respuesta_id_vivienda = await client.query(`
            SELECT id_vivienda FROM Anuncios WHERE id_anuncio = $1`, [id_anuncio]);

        const id_vivienda = respuesta_id_vivienda.rows[0].id_vivienda;

        if(accepts) {
            await client.query(`INSERT INTO Estancias(id_inquilino, id_vivienda) VALUES ($1, $2)`,
                [id_inquilino, id_vivienda]
            );

            await client.query(`UPDATE Solicitudes SET estado = 'Aceptada' WHERE id_inquilino = $1
                AND id_anuncio = $2;`, [id_inquilino, id_anuncio]);
        } else {
            await client.query(`UPDATE Solicitudes SET estado = 'Rechazada' WHERE id_inquilino = $1
                AND id_anuncio = $2;`, [id_inquilino, id_anuncio]);
        }

        await client.query('COMMIT;');

        res.status(200).json({
            success: true,
            message: accepts ? 'La solicitud se ha aceptado correctamente' : 'La solicitud se ha rechazado correctamente'
        });
    } catch(error) {
        console.error('Error al procesar la solicitud: ', error);
        res.status(500).json({
            success: false,
            message: 'No se ha podido completar la solicitud correctamente'
        });
    }
});

app.post('/api/valoraciones/usuario', verificarToken, async(req, res) => {
    const id_valorador = req.user.id_usuario;

    const client = await pool.connect();

    try {
        const resultado = await client.query(`SELECT * FROM Criterios_Valoracion ORDER BY id_criterio;`);

        const cuestiones = resultado.rows;

        res.status(200).json({
            success: true,
            message: 'Se han obtenido las cuestiones de las valoraciones correctamente',
            cuestiones: cuestiones
        })
    } catch(error) {
        console.log('Error al obtener las preguntas de las valoraciones: ', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las preguntas de las valoraciones'
        })
    } finally {
        client.release();
    }
});

app.post('/api/valoraciones/usuario/enviar', verificarToken, async (req, res) => {
    const id_usuario = req.user.id_usuario;

    const calificaciones = req.body.calificaciones;
    const id_valorado = req.body.id_valorado;
    const id_estancia = req.body.id_estancia;

    const array_calificaciones = Object.entries(calificaciones);

    const client = await pool.connect();

    try {
        await client.query(`BEGIN;`);

        const respuesta_valoracion = await client.query(`
            INSERT INTO Valoraciones(id_estancia, id_valorador, id_valorado, comentario)
            VALUES ($1, $2, $3, $4) RETURNING id_valoracion`,
            [id_estancia, id_usuario, id_valorado, '']);

        const id_valoracion = respuesta_valoracion.rows[0].id_valoracion;

        for (const calificacion of array_calificaciones) {
            await client.query(`
                INSERT INTO Puntuacion_Criterios(id_criterio, id_valoracion, puntuacion)
                VALUES($1, $2, $3)`,
                [calificacion[0], id_valoracion, calificacion[1]]);
        }

        await client.query(`COMMIT;`);

        res.status(200).json({
            success: true,
            message: 'Se ha almacenado la valoración correctamente'
        });
    } catch(error) {
        await client.query('ROLLBACK;');
        console.error('Error: ', error);
        res.status(500).json({
            success: false,
            message: 'No se han podido enviar las calificaciones'
        })
    } finally {
        client.release();
    }
});

app.post('/api/interaccion/new', verificarToken, async (req, res) => {
    const id_usuario = req.user.id_usuario;

    const client = await pool.connect();

    const id_anuncio = req.body.id_anuncio;
    const tipo = req.body.tipo;
    const peso = req.body.peso;

    try {
        await client.query('BEGIN');

        await client.query(`
            INSERT INTO 
            Interacciones_Anuncios
            (id_inquilino, id_anuncio, peso_interaccion, tipo_interaccion)
            VALUES
            ($1, $2, $3, $4);
            `,
            [id_usuario, id_anuncio, peso, tipo]
        );

        await client.query('COMMIT');

        res.status(200).json({
            success: true,
            message: 'Interacción almacenada correctamente'
        })

    } catch(error) {
        console.error('Error: ', error);
        res.status(500).json({
            success:  false,
            message: 'Error al almacenar la interaccion'
        })
    }
});

app.post('/api/interaccion/eliminarFavoritos', verificarToken, async (req, res) => {
    const id_inquilino = req.user.id_usuario;
    const id_anuncio = req.body.id_anuncio;
    const client = await pool.connect();

    try {
        await client.query(`
                DELETE FROM 
                    Interacciones_Anuncios 
                    WHERE
                    id_inquilino = $1 
                    AND 
                    id_anuncio = $2
                    AND
                    tipo_interaccion = 'favoritos';
            `, [
                id_inquilino, id_anuncio
            ]);

        res.status(200).json({
            success: true,
            message: 'Anuncio eliminado de favoritos correctamente'
        });
    } catch(error) {
        console.error('Error', error);
        res.status(500).json({
            success: false,
            message: 'Error al intentar quitar  de favoritos'
        })
    }
})

// Arranque del servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});