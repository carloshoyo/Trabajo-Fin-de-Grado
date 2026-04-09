import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pool from './db.js'; // ¡OJO! En el sistema moderno el .js es obligatorio aquí

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

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
    } else if(userData.rol === ' casero') {
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
            res.status(200).json({
                success: true,
                message: 'Inicio de sesión exitoso',
                userData: {
                    id_usuario: usuario.id_usuario,
                    rol: usuario.rol
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

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});