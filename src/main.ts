import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { urlencoded, json } from 'body-parser';
import { ValidationPipe } from '@nestjs/common';
import * as cors from 'cors';
import { HttpExceptionFilter } from './common/exceptions/http.exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const PORT = process.env.PORT;

    app.use(cors());
    app.use(json({ limit: '5mb' }));
    app.use(urlencoded({ limit: '5mb', extended: true }));
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.listen(PORT);
}
bootstrap();
