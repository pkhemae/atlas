import { v7 as uuidv7 } from 'uuid'
import { BaseModel, beforeCreate, column } from '@adonisjs/lucid/orm'
import type { NormalizeConstructor } from '@adonisjs/core/types/helpers'

/**
 * Gives a model a self-assigned UUID v7 primary key. Time-ordered, so
 * index locality stays good while ids remain non-guessable.
 */
export const WithPrimaryUuid = <Model extends NormalizeConstructor<typeof BaseModel>>(
  superclass: Model
) => {
  class WithPrimaryUuidClass extends superclass {
    static selfAssignPrimaryKey = true

    @column({ isPrimary: true })
    declare id: string

    @beforeCreate()
    static assignUuid(model: WithPrimaryUuidClass) {
      model.id = uuidv7()
    }
  }
  return WithPrimaryUuidClass
}
