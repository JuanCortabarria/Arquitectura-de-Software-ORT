import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import type { Asset } from './asset';

// Modelo Sequelize para la entidad Asset.
//
// Mapea la interfaz Asset (src/models/asset.ts) a la tabla "assets"
// en MySQL. La interfaz original NO se modifica: sigue siendo el
// contrato de la aplicación.
//
// timestamps: false porque la interfaz Asset no tiene createdAt/updatedAt.

class AssetModel extends Model<Asset> implements Asset {
  declare id: string;
  declare symbol: string;
  declare name: string;
  declare quantity: number;
  declare purchasePrice: number;
}

AssetModel.init(
  {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
    },
    symbol: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    purchasePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'assets',
    timestamps: false,
  },
);

export default AssetModel;
