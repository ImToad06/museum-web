import { fail, redirect } from '@sveltejs/kit';
import db from '$lib/server/db';
import { writeFileSync } from 'fs';
import { join } from 'path';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const titulo = data.get('titulo') as string;
		const autor = data.get('autor') as string;
		const fecha = data.get('fecha') as string;
		const imagen = data.get('imagen') as File;

		if (!titulo || !autor || !fecha || !imagen || imagen.size === 0) {
			return fail(400, { error: 'Todos los campos son obligatorios' });
		}

		const ext = imagen.name.split('.').pop();
		const fileName = `${crypto.randomUUID()}.${ext}`;
		const filePath = join(process.cwd(), 'static', 'uploads', fileName);

		try {
			const arrayBuffer = await imagen.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);
			writeFileSync(filePath, buffer);

			const stmt = db.prepare(
				'INSERT INTO obras (titulo, autor, fecha, imagen_url) VALUES (?, ?, ?, ?)'
			);
			stmt.run(titulo, autor, fecha, `/uploads/${fileName}`);
		} catch (err) {
			console.error(err);
			return fail(500, { error: 'Error al guardar la obra de arte' });
		}

		throw redirect(303, '/galeria');
	}
};
