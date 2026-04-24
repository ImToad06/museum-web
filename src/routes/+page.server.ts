import db from '$lib/server/db';

export const load = async () => {
	const obras = db.prepare('SELECT * FROM obras ORDER BY creado_en DESC').all();
	return {
		obras: obras as Array<{
			id: number;
			titulo: string;
			autor: string;
			fecha: string;
			imagen_url: string;
			creado_en: string;
		}>
	};
};
