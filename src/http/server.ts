import http from 'node:http';
import { URL } from 'node:url';
import {BingoCard} from  '../ model/cartela';


const port = 3000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface Route {
  method: HttpMethod;
  path: string;
  handler: (req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) => Promise<void>;
}

const routes: Route[] = [
  {
    method: 'GET',
    path: '/',
    handler: async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Bem-vindo à  PAGINA oficial do Bingo PAY');
    }
  },
  {
    method: 'GET',
    path: '/cartela/all',
    handler: async (req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      const num: string [] = [];
      for (let i = 1; i <= 10; i++) {
        const card = new BingoCard();
        num.push(" cartela: "+i+" ");
        num.push(card.geraCartela().toString());
        num.push(" ******* : ");
        card.mostraCartelas();
      }
      res.end(JSON.stringify(num));
    }
  },
  {
    method: 'GET',
    path: '/cartela/one',
    handler: async (req, res) => {

        
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      const card = new BingoCard();
      card.mostraCartelas();
      res.end(JSON.stringify(  card.geraCartela()));
    }
  },
  {
    method: 'POST',
    path: '/api/dados',
    handler: async (req, res) => {
      const buffers = [];
      for await (const chunk of req) {
        buffers.push(chunk);
      }
      const data = Buffer.concat(buffers).toString();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Dados recebidos', data }));
    }
  }
] as const;

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url ?? '', `http://${req.headers.host}`);
  const path = parsedUrl.pathname;
  const method = req.method as HttpMethod ?? 'GET';

  const route = routes.find(r => r.method === method && r.path === path);

  if (route) {
    try {
      await route.handler(req, res);
    } catch (error) {
      console.error('Erro ao processar a requisição:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Erro interno do servidor');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}/`);
});
