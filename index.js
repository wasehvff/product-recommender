import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors'
import { OpenAI } from "langchain/llms/openai";
import { DataSource } from "typeorm";
import { SqlDatabase } from "langchain/sql_db";
import { SqlDatabaseChain } from "langchain/chains";


const app = express()
const port = process.env.PORT || 4000
app.use(express.json())
app.use(cors())

let datasource
try {
  
 datasource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "products",
  });
} catch (error) {
  console.log(error)
}

const db = await SqlDatabase.fromDataSourceParams({
  appDataSource: datasource,
});

const chain = new SqlDatabaseChain({
  llm: new OpenAI({ openAIApiKey :process.env.OPENAI_API_KEY , temperature: 0 }),
  database: db,
});

  app.post('/product_recommend', async (req, res) => {
  try {
  const { prompt } = req.body
  const result = await chain.run(prompt);
  console.log(result);


  res.json({ 
  success: true,
  message : result
  })

  } catch (error) {
  res.status(400).json({
    success:false,
    error : error.message
  })       
 }
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
