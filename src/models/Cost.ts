import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Cost extends Model {
  public id!: number;
  public provider!: string;
  public timestamp!: Date;
  public amount!: number;
  public currency!: string;
  public service!: string;
  public metadata!: string; // JSON string
}

Cost.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  provider: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  service: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Cost',
});
