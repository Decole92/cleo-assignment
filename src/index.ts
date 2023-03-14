import * as express from 'express';
import * as bodyParser from 'body-parser';
import { createHandler, fetchFunc } from '../src/controller/cleo-assignment-handler';
import { FetchFunction } from 'typing';

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.get('/', (req, res) => res.send("Hello from Homepage"))

const ttl = 10000;
const fetchValues: FetchFunction = async (id: number) => {
return fetchFunc(id);
};
  
app.use('/api',  createHandler(ttl, fetchValues));
app.listen(PORT, () => console.log(`Server Running On http://localhost:3000/`));

