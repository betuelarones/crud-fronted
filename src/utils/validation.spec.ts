import { describe, expect, it } from 'vitest'
import { validateCategory, validateProduct } from '@/utils/validation'

describe('validateProduct', () => {
  it('accepts a complete valid product', () => {
    expect(
      validateProduct({
        name: 'Camiseta Test',
        description: 'Algodón',
        price: '89.90',
        stock: '5',
        category_id: 1,
      }),
    ).toEqual({})
  })

  it('requires name, price, stock and category', () => {
    const errors = validateProduct({
      name: '   ',
      description: '',
      price: '',
      stock: '',
      category_id: null,
    })

    expect(errors).toMatchObject({
      name: 'El nombre es obligatorio.',
      price: 'El precio es obligatorio.',
      stock: 'El stock es obligatorio.',
      category_id: 'La categoría es obligatoria.',
    })
  })

  it('rejects invalid numeric values', () => {
    const errors = validateProduct({
      name: 'Producto',
      description: '',
      price: '-1',
      stock: '1.5',
      category_id: 'abc',
    })

    expect(errors.price).toBe('El precio debe ser un número mayor que cero.')
    expect(errors.stock).toBe('El stock debe ser un entero mayor o igual que cero.')
    expect(errors.category_id).toBe('Selecciona una categoría válida.')
  })

  it('enforces maximum lengths and maximum price', () => {
    const errors = validateProduct({
      name: 'a'.repeat(151),
      description: 'b'.repeat(2001),
      price: '100000000',
      stock: '0',
      category_id: 1,
    })

    expect(errors.name).toBe('El nombre no puede superar los 150 caracteres.')
    expect(errors.description).toBe('La descripción no puede superar los 2000 caracteres.')
    expect(errors.price).toBe('El precio supera el máximo permitido.')
  })
})

describe('validateCategory', () => {
  it('accepts a valid category', () => {
    expect(validateCategory({ name: 'Camisetas', description: '' })).toEqual({})
  })

  it('requires a name and limits its length', () => {
    expect(validateCategory({ name: '  ', description: '' }).name).toBe('El nombre es obligatorio.')
    expect(validateCategory({ name: 'a'.repeat(121), description: '' }).name).toBe(
      'El nombre no puede superar los 120 caracteres.',
    )
  })

  it('limits the description length', () => {
    expect(validateCategory({ name: 'Camisetas', description: 'a'.repeat(2001) }).description).toBe(
      'La descripción no puede superar los 2000 caracteres.',
    )
  })
})
