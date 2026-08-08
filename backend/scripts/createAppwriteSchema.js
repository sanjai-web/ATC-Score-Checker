const { Client, Databases } = require('node-appwrite');
require('dotenv').config();

const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const dbId = process.env.APPWRITE_DB_ID;
const collectionId = process.env.APPWRITE_RESUMES_COL;

async function run() {
    try {
        console.log("Checking Appwrite Database...");
        try {
            await databases.get(dbId);
            console.log(`Database "${dbId}" exists.`);
        } catch (e) {
            console.log(`Database "${dbId}" not found. Creating...`);
            await databases.create(dbId, dbId);
            console.log(`Database "${dbId}" created successfully.`);
        }

        console.log("Checking Appwrite Collection...");
        try {
            await databases.getCollection(dbId, collectionId);
            console.log(`Collection "${collectionId}" exists.`);
        } catch (e) {
            console.log(`Collection "${collectionId}" not found. Creating...`);
            await databases.createCollection(dbId, collectionId, collectionId);
            console.log(`Collection "${collectionId}" created successfully.`);
        }

        const attributes = [
            { key: 'userName', type: 'string', size: 255, required: true },
            { key: 'userEmail', type: 'string', size: 255, required: true },
            { key: 'userMobile', type: 'string', size: 50, required: false },
            { key: 'degree', type: 'string', size: 255, required: true },
            { key: 'department', type: 'string', size: 255, required: true },
            { key: 'college', type: 'string', size: 255, required: true },
            { key: 'graduationYear', type: 'string', size: 50, required: true },
            { key: 'currentStatus', type: 'string', size: 100, required: true },
            { key: 'targetRole', type: 'string', size: 255, required: false },
            { key: 'company', type: 'string', size: 255, required: false },
            { key: 'jobDescription', type: 'string', size: 5000, required: false },
            { key: 'fileName', type: 'string', size: 255, required: true },
            { key: 'fileUrl', type: 'string', size: 1000, required: true },
            { key: 'storageProvider', type: 'string', size: 100, required: true, default: 'appwrite' },
            { key: 'overallScore', type: 'integer', required: true },
            { key: 'createdAt', type: 'string', size: 100, required: true },
            { key: 'atsData', type: 'string', size: 65536, required: true }
        ];

        console.log("Creating attributes (this may take a minute to register in Appwrite)...");
        for (const attr of attributes) {
            try {
                if (attr.type === 'string') {
                    await databases.createStringAttribute(
                        dbId,
                        collectionId,
                        attr.key,
                        attr.size,
                        attr.required,
                        attr.default || null
                    );
                } else if (attr.type === 'integer') {
                    await databases.createIntegerAttribute(
                        dbId,
                        collectionId,
                        attr.key,
                        attr.required
                    );
                }
                console.log(`✓ Attribute "${attr.key}" successfully created.`);
                // Appwrite asynchronous workers require brief pauses to ensure proper task sequencing
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                if (e.code === 409) {
                    console.log(`Attribute "${attr.key}" already exists (skipped).`);
                } else {
                    throw e;
                }
            }
        }
        console.log("\n🎉 Schema creation completed successfully!");
    } catch (err) {
        console.error("\n❌ Failed to create schema:", err.message);
        console.log("\n💡 IMPORTANT CONFIGURATION REQUIREMENT:");
        console.log("   Since Appwrite restricts administrative metadata writes, please log into your Appwrite Console");
        console.log("   and verify that your API Key has the following scopes checked under settings:");
        console.log("     - databases.write");
        console.log("     - collections.write");
        console.log("     - attributes.write");
        console.log("\n   Alternatively, you can manually add the missing columns directly in the Appwrite Console");
        console.log("   inside the Database 'resumes' collection attribute list.");
    }
}

run();
