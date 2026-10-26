// Forward Sequelize's bundled default type because NodeNext resolves the package
// root to JavaScript and does not pick up the declaration correctly.

declare module 'sequelize' {
  export { default } from 'sequelize/types/sequelize'
  export { Model } from 'sequelize/types/model'
  export type { ModelStatic } from 'sequelize/types/model'
}
