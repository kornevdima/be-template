import { Controller, Get, Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { parse } from 'url';

import { ViewService } from './view.service';
import { ConfigService } from '@nestjs/config';

@Controller()
export class ViewController {
  constructor(
    private viewService: ViewService,
    private readonly configService: ConfigService,
  ) {}

  async handler(req: Request, res: Response) {
    const parsedUrl = parse(req.url, true);
    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, parsedUrl.query);
  }

  @Get('*')
  public async showHome(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);
    const serverSideProps = {
      API_HOST: `http://localhost:${this.configService.get('PORT')}`,
    };

    await this.viewService
      .getNextServer()
      .render(
        req,
        res,
        parsedUrl.pathname,
        Object.assign(parsedUrl.query, serverSideProps),
      );
  }

  @Get('_next*')
  public async assets(@Req() req: Request, @Res() res: Response) {
    const parsedUrl = parse(req.url, true);
    await this.viewService
      .getNextServer()
      .render(req, res, parsedUrl.pathname, parsedUrl.query);
  }
}
