import { Client, Databases, ID, Query } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;


const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') // Your Appwrite Endpoint
    .setProject(PROJECT_ID); 

const database = new Databases(client);

export const updateSearchCount = async(searchTerm, movie ) => {
    // Uing Appwrite SDK to check if a document existsin the database
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [ Query.equal('searchTerm', searchTerm),])
    
    // If document exists, update the count
    if(result.documents.length > 0){
        const doc = result.documents[0];

        await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
            count: doc.count+1,
        })
    }
    else{
        // If document does not exist, create a new one
        await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
            searchTerm,
            count: 1,
            poster_url : `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            movie_id: movie.id,
        })
    }
    
    } catch(error){
        console.log(error);
    }
}


export const getTrendingMovies = async() =>{
    try{
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [ 
            Query.limit(5),
            Query.orderDesc('count')])

        return result.documents;
    }  catch(error){
        console.log(error);
    }
}