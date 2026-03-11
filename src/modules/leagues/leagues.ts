import { pool } from "../../database/connectDb";
import { Leagues } from "../../types/types";
import { leaguesSchema } from "../../schema/schemaCheck";
import { formatZodError } from "../../utils/formatZodError";


export const createLeague = async (league: Leagues) => {
    const parsed = leaguesSchema.safeParse(league);

    if (!parsed.success) {
        return {
            success: false,
            message: formatZodError(parsed.error)

        }
    }

    const { title, campus_id, category, season, year, status, start_date, end_date, max_players } = parsed.data;

    const query = `INSERT INTO leagues (title, campus_id, category, season, year, status, start_date, end_date, max_players) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
    const values = [title, campus_id, category, season, year, status, start_date, end_date, max_players];

    const client = await pool.connect();

    try {
        //check if league already exists
        const checkLeague = await client.query(`SELECT * FROM leagues WHERE title = $1`, [title]);
        if (checkLeague.rows.length > 0) {
            return {
                success: false,
                message: "League already exists"
            }
        }

        //check if campus id is valid
        const checkCampus = await client.query(`SELECT * FROM campuses WHERE id = $1`, [campus_id]);
        if (checkCampus.rows.length === 0) {
            return {
                success: false,
                message: "Invalid campus id"
            }
        }
        const result = await client.query(query, values);

        return {
            success: true,
            message: "League created successfully",
            data: result.rows[0]
        };

    } catch (error) {

        return {
            success: false,
            message: "Failed to create league"
        };

    } finally {
        client.release();
    }
};
export const updateLeague = async (input: Leagues) => {
    const parsed = leaguesSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: formatZodError(parsed.error),
        };
    }

    const { id, title, campus_id, category, season, year, status, start_date, end_date, max_players } = parsed.data;

    // check if league exists
    const checkLeague = await pool.query(`SELECT * FROM leagues WHERE id = $1`, [id]);
    if (checkLeague.rows.length === 0) {
        return { success: false, message: "League not found" };
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (title && title.trim() !== "") {
        fields.push(`title = $${index}`);
        values.push(title);
        index++;
    }
    if (campus_id && campus_id.trim() !== "") {
        const checkCampus = await pool.query(`SELECT * FROM campuses WHERE id = $1`, [campus_id]);
        if (checkCampus.rows.length === 0) {
            return { success: false, message: "Invalid campus id" };
        }
        fields.push(`campus_id = $${index}`);
        values.push(campus_id);
        index++;
    }
    if (category) {
        fields.push(`category = $${index}`);
        values.push(category);
        index++;
    }
    if (season) {
        fields.push(`season = $${index}`);
        values.push(season);
        index++;
    }
    if (max_players !== undefined && max_players !== null) {
        fields.push(`max_players = $${index}`);
        values.push(max_players);
        index++;
    }
    if (year !== undefined && year !== null) {
        fields.push(`year = $${index}`);
        values.push(year);
        index++;
    }
    if (status) {
        fields.push(`status = $${index}`);
        values.push(status);
        index++;
    }
    if (start_date) {
        fields.push(`start_date = $${index}`);
        values.push(start_date);
        index++;
    }
    if (end_date) {
        fields.push(`end_date = $${index}`);
        values.push(end_date);
        index++;
    }

    if (fields.length === 0) {
        return { success: false, message: "No fields to update provided" };
    }

    // finally push id for WHERE clause
    values.push(id);

    const query = `
    UPDATE leagues
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *;
  `;

    console.log(query)

    try {
        const result = await pool.query(query, values);
        return {
            success: true,
            message: "League updated successfully",
            data: result.rows[0],
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};

export const getLeagueById = async (id: unknown) => {
    try {
        const query = `SELECT * FROM leagues WHERE id = $1`;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) {
            return {
                success: false,
                message: "League not found"
            };
        }
        return {
            success: true,
            message: "League retrieved successfully",
            data: result.rows[0]
        };
    } catch (error: any) {
        return {
            success: false,
            message: error.message
        };
    }
}


export const deleteLeague = async (id: string) => {
    const query = `DELETE FROM leagues WHERE id = $1`;
    const values = [id];

    const client = await pool.connect();

    try {
        //check if id is valid
        const checkLeague = await client.query(`SELECT * FROM leagues WHERE id = $1`, [id]);
        if (checkLeague.rows.length === 0) {
            return {
                success: false,
                message: "Invalid league id"
            }
        }
        const result = await client.query(query, values);
        return {
            success: true,
            message: "League deleted successfully",
            data: result.rows[0],
        };
    } catch (error: any) {
        return { success: false, message: error.message };
    } finally {
        client.release();
    }
}