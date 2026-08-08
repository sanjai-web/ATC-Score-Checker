const { Client, Databases } = require('node-appwrite');

const appwriteClient = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(appwriteClient);

const ensureSchema = async () => {
    const dbId = process.env.APPWRITE_DB_ID;
    const resumesCol = process.env.APPWRITE_RESUMES_COL;

    console.log(`Checking Appwrite Database schema: DB_ID=${dbId}, Collection=${resumesCol}...`);

    const attributes = [
        { key: 'degree', size: 255 },
        { key: 'department', size: 255 },
        { key: 'college', size: 255 },
        { key: 'graduationYear', size: 50 },
        { key: 'currentStatus', size: 100 },
        { key: 'jobDescription', size: 5000 }
    ];

    for (const attr of attributes) {
        try {
            await databases.createStringAttribute(
                dbId,
                resumesCol,
                attr.key,
                attr.size,
                false // not required
            );
            console.log(`Successfully created Appwrite database attribute: "${attr.key}"`);
            
            // Appwrite attributes require brief processing time to become available.
            // A short pause ensures they don't collision when created in rapid succession.
            await new Promise(resolve => setTimeout(resolve, 800));
        } catch (error) {
            // Error code 409 means the attribute already exists, which is expected on subsequent runs
            if (error.code === 409) {
                // Attribute already exists, silent skip
            } else {
                console.warn(`[Appwrite Schema Warning] Could not ensure attribute "${attr.key}":`, error.message);
            }
        }
    }
    console.log('Appwrite Database schema check complete.');
};

module.exports = {
    databases,
    ensureSchema
};
