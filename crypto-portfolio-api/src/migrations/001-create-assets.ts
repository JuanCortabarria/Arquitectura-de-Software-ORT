import { QueryInterface, DataTypes } from 'sequelize';

// Migración: crea la tabla "assets" en MySQL.
//
// Esta migración define la estructura relacional de la entidad Asset.
// Se ejecuta automáticamente al arrancar la aplicación si la tabla
// no existe (a través de sequelize.sync()). Este archivo sirve como
// documentación formal de la estructura y como referencia para
// migraciones futuras.
//
// En producción se usaría sequelize-cli para ejecutar migraciones
// de forma controlada. Para este proyecto educativo, sequelize.sync()
// se encarga de crear la tabla.

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.createTable('assets', {
    id: {
      type: DataTypes.STRING(36),
      primaryKey: true,
      allowNull: false,
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
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('assets');
}
