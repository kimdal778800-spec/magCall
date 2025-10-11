import { getConnection } from '@/lib/db';

export default async function handler(req, res) {
    try {
        const conn = await getConnection();

        if (req.method === 'GET') {
            const [rows] = await conn.query('SELECT * FROM users');
            console.log('✅ API result:', rows); // <-- 추가
            res.status(200).json(rows);
        }

        if (req.method === 'POST') {
            const { name, email } = req.body;
            await conn.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
            res.status(201).json({ message: 'User created successfully' });
        }

        await conn.end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database Error' });
    }
}
