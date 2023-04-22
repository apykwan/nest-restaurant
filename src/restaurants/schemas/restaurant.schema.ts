import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';

@Schema() 
export class Location {
  @Prop({ type: String, enum: ['Point'] })
  type: string

  @Prop({ index: '2dsphere' })
  coordinates: number[];
  formattedAddress: string;
  city: string;
  state: string;
  zipcode: string;
  country: string;
}

export enum Category {
  FAST_FOOD = 'Fast Food',
  CAFE = 'Cafe',
  FINE_DINNING = 'Fine Dinning',
  DELI = 'Deli',
  STREET_FOOD = 'Street Food',
  DESSERT = 'Dessert'
}

@Schema()
export class Restaurant {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ unique: true })
  email: string;

  @Prop()
  phoneNo: number;

  @Prop()
  address: string;

  @Prop()
  category: Category;

  @Prop()
  images?: object[];

  @Prop({ type: Object, ref: 'Location' })
  location?: Location
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);