import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ControlsController } from './controls.controller';
import { ControlsService } from './controls.service';
import { Control, ControlSchema } from './schemas/control.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Control.name, schema: ControlSchema }])
  ],
  controllers: [ControlsController],
  providers: [ControlsService],
  exports: [ControlsService],
})
export class ControlsModule {}