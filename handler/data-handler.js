
import { readJsonFile } from '../helper/readjson.js';

export async function handleDataRecipes(req, res) {
//     G:\project\Hacktiv8\chat-bot-hacktiv8\Dummy\json\recipes.json
//     G:\project\Hacktiv8\Dummy\json\recipe
// s.json
    const recipesData = await readJsonFile('./Dummy/json/recipes.json');

    try {

        // loop array
        return res.status(200).json({ data: recipesData });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}