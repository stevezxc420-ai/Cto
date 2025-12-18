import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Usage extends Model {
  public id!: number;
  public provider!: string;
  public resourceId!: string;
  public timestamp!: Date;
  public metric!: string;
  public value!: number;
  public unit!: string;
  public metadata!: string; // JSON string
}

Usage.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  resourceId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  metric: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Usage',
});
