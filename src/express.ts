import express, { type Request, type Response } from "express";

const port = process.env.PORT || 4000;

export const initExpress = () => {
  const app = express();

  app.get("/ping", (req: Request, res: Response) => {
    res.send("OK").status(200);
  });

  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
};
