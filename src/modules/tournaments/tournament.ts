import { pool } from "../../database/connectDb";
import { tournamentSchema } from "../../schema/schemaCheck";
import { tournament } from "../../types/types";
import { formatZodError } from "../../utils/formatZodError";

export const createTournament = async (input: tournament) => {
    const parsedInput = tournamentSchema.safeParse(input);

    //check if input is correct
    if (!parsedInput.success) {
        return {
            success: false,
            message: formatZodError(parsedInput.error)
        }
    }
    const { title, type, campus_id, year, status, match_type, group_size, knockout_stages, rules } = parsedInput.data;

    //check if tournament already exists
    const checkTournament = await pool.query(`SELECT * FROM tournaments WHERE title = $1 AND year = $2`, [title, year]);
    if (checkTournament.rows.length > 0) {
        throw new Error("Tournament already exists");
    }

    //check if types is campus, if so campus_id should not be empty
    if (type === "campus") {
        if (!campus_id) {
            throw new Error("Campus ID is required for campus tournaments");
        }

        // Check if campus exists
        const campus = await pool.query(
            `SELECT * FROM campuses WHERE id = $1`,
            [campus_id]
        );

        if (campus.rows.length === 0) {
            throw new Error("Campus not found");
        }
    }

    //check if types is national, if so campus_id should be empty
    if (type === "national" && campus_id) {
        throw new Error("Campus ID is not required for national tournaments");
    }
    const query = `
        INSERT INTO tournaments (title, type, campus_id, year, status, match_type, group_size, knockout_stages, rules)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `;
    const values = [title, type, campus_id, year, status, match_type, group_size, knockout_stages, rules];
    const result = await pool.query(query, values);
    return result.rows[0];
}

export const getAllTournaments = async () => {
    const query = `SELECT * FROM tournaments`;
    const result = await pool.query(query);
    return result.rows;
}

export const getTournamentById = async (id: unknown) => {
    const query = `SELECT * FROM tournaments WHERE id = $1`;
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
        throw new Error("Tournament not found");
    }
    return result.rows[0];
}

export const updateTournament = async (id: unknown, input: tournament) => {
    const { title, type, campus_id, year, status, match_type, group_size, knockout_stages, rules } = input;
    //check if input is correct
    const parsedInput = tournamentSchema.partial().safeParse(input);

    if (!parsedInput.success) {
        return {
            success: false,
            message: formatZodError(parsedInput.error)
        }
    }
    //check if tournament exists
    const tournament = await getTournamentById(id);
    if (!tournament) {
        throw new Error("Tournament not found");
    }
    const fields = [];
    const values = [];
    let index = 1;
    if (title && title.trim() !== "") {
        fields.push(`title = $${index}`);
        values.push(title);
        index++;
    }
    if (type && type.trim() !== "") {
        fields.push(`type = $${index}`);
        values.push(type);
        index++;
    }
    if (campus_id && campus_id.trim() !== "") {

        if (type === "national") {
            throw new Error("Campus ID is not required for national tournaments");
        }
        //check if campus exists
        const campus = await pool.query(
            `SELECT * FROM campuses WHERE id = $1`,
            [campus_id]
        );

        if (campus.rows.length === 0) {
            throw new Error("Campus not found");
        }
        fields.push(`campus_id = $${index}`);
        values.push(campus_id);
        index++;
    }
    if (year && year !== null) {
        fields.push(`year = $${index}`);
        values.push(year);
        index++;
    }
    if (status && status.trim() !== "") {
        fields.push(`status = $${index}`);
        values.push(status);
        index++;
    }
    if (match_type && match_type.trim() !== "") {
        fields.push(`match_type = $${index}`);
        values.push(match_type);
        index++;
    }
    if (group_size !== null && group_size !== undefined) {
        fields.push(`group_size = $${index}`);
        values.push(group_size);
        index++;
    }
    if (knockout_stages !== null && knockout_stages !== undefined) {
        fields.push(`knockout_stages = $${index}`);
        values.push(knockout_stages);
        index++;
    }
    if (rules !== null && rules !== undefined) {
        fields.push(`rules = $${index}`);
        values.push(rules);
        index++;
    }
    if (fields.length === 0) {
        throw new Error("No fields provided for update");
    }
    values.push(id);
    const query = `
        UPDATE tournaments 
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *;
    `;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
        throw new Error("Tournament not found");
    }
    // console.log("Updated tournament:", result.rows[0]);
    return result.rows[0];
}

//delete tournament
export const deleteTournament = async (id: unknown) => {
    const tournament = await getTournamentById(id);
    if (!tournament) {
        throw new Error("Tournament not found");
    }
    const query = `DELETE FROM tournaments WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}