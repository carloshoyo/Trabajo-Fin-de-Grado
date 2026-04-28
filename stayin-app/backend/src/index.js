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
            encryptedPasswd, // ¡Dato encriptado!
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
        const resultado = await client.query('SELECT id_usuario, passwd, rol FROM Usuarios WHERE username=$1 OR email=$1 OR numero_tlf=$1', [
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
        }
        
        res.status(200).json({
            success: true,
            message: 'El usuario tiene anuncios publicados',
            adData: resultado.rows
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
                            descripcion, numero, puerta, cpostal) VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                            RETURNING id_vivienda;`, [
                                id_casero,adData.area, adData.direccion, adData.max_inquilinos,
                                adData.descripcion, adData.numero, adData.puerta, adData.cp
                            ]);

        const id_vivienda = viviendaResult.rows[0].id_vivienda;

        await client.query(`INSERT INTO Anuncios(id_vivienda, id_casero, titulo, img, direccion,
                            precio, multimedia) VALUES($1, $2, $3, $4, $5, $6)`, [
                                id_vivienda, id_casero, adData.title, adData.portada,
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

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});