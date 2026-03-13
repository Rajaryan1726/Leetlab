import axios from "axios";

export const getJudge0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVASCRIPT": 63,
        "CPP": 54,
        "JAVA": 62,
        // Add more languages and their corresponding IDs as needed
    };

    return languageMap[language.toUpperCase()];

};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const submitBatch = async (submissions) => {
      const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,{
        submissions
    });

    console.log("Submissions results: ", data);
    return data;
};

export const getLanguageNameById = (languageId) => {
    const languageMap = {
        71: "python",
        63: "javascript",
        54: "cpp",
        62: "java",
        // Add more languages and their corresponding IDs as needed
    };

    return languageMap[languageId];
};

export const pollBatchResults = async (tokens) => {
    while (true) {
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`, {
            params: {
                tokens: tokens.join(","),
                base64_encoded: false,
            }
        })
        const results = data.submissions;
        const isAllDone = results.every((result) => result.status.id !== 1 && result.status.id !== 2);
        if (isAllDone) {
            console.log("Final Results: ", results);
            return results;
        }
        console.log("Some submissions are still processing. Waiting for 2 seconds before polling again...");
        await sleep(2000);
    }
};