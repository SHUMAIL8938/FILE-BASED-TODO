import express from 'express';
import fs from 'fs/promises';            
import path from 'path';                  
import { fileURLToPath } from 'url';

const app = express()
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TODOS_FILE = path.join(__dirname, 'todos.json');

async function readTodos(){
  try {
    const data =await fs.readFile(TODOS_FILE,'utf-8');
    return JSON.parse(data);
  }
  catch(err){
    console.error('Error reading todos file:', err);
    return [];
  }
}
async function writeTodos(todos){
  try {
    await fs.writeFile(TODOS_FILE, JSON.stringify(todos, null, 2));
  } catch (err) {
    console.error('Error writing todos file:', err);
  }
}


app.get('/todos', async(req, res) => {
  const todos= await readTodos();
  if (!todos) { return res.status(500).send('Error reading todos'); }
  res.json(todos);
})
app.post('/todos', async(req, res) => {
  const {title} = req.body;
  if (!title) { return res.status(400).send('Title is required'); }
  const todos = await readTodos();
  if (!todos) { return res.status(500).send('Error reading todos'); }

  const nextId = todos.length > 0
    ? Math.max(...todos.map(t => t.id)) + 1
    : 1;
  const newTodo = { id: nextId, title, completed: false };
  todos.push(newTodo);
  await writeTodos(todos);
  res.status(201).json(newTodo);
}) 
app.patch('/todos/:id',async(req,res)=>{
  const id=parseInt(req.params.id);
  const todos = await readTodos();
  if (!todos) { return res.status(500).send('Error reading todos'); }
  const todo = todos.find(todo => todo.id === id);
  if (!todo) { return res.status(404).send('Todo not found'); }
  todo.completed=true;
  await writeTodos(todos);
  res.json(todo);
})
app.delete('/todos/:id',async (req,res)=>{
  const id=parseInt(req.params.id);
  const todos = await readTodos();
  if (!todos) { return res.status(500).send('Error reading todos'); }
  const todo = todos.find(todo => todo.id === id);
  if (!todo) { return res.status(404).send('Todo not found'); }
  todos.splice(todos.indexOf(todo), 1);
  await writeTodos(todos);
  res.json(todos);
})
app.listen(3000)