export type FormErrors = Record<string, string>

interface ProductFormInput {
  name: string
  description: string
  price: string | number
  stock: string | number
  category_id: string | number | null
}

interface CategoryFormInput {
  name: string
  description: string
}

export function validateProduct(input: ProductFormInput): FormErrors {
  const errors: FormErrors = {}
  const name = input.name.trim()
  const price = Number(input.price)
  const stock = Number(input.stock)
  const categoryId = Number(input.category_id)

  if (!name) {
    errors.name = 'El nombre es obligatorio.'
  } else if (name.length > 150) {
    errors.name = 'El nombre no puede superar los 150 caracteres.'
  }

  if (input.description.trim().length > 2000) {
    errors.description = 'La descripción no puede superar los 2000 caracteres.'
  }

  if (input.price === '' || input.price === null) {
    errors.price = 'El precio es obligatorio.'
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.price = 'El precio debe ser un número mayor que cero.'
  } else if (price > 99999999.99) {
    errors.price = 'El precio supera el máximo permitido.'
  }

  if (input.stock === '' || input.stock === null) {
    errors.stock = 'El stock es obligatorio.'
  } else if (!Number.isInteger(stock) || stock < 0) {
    errors.stock = 'El stock debe ser un entero mayor o igual que cero.'
  }

  if (!input.category_id) {
    errors.category_id = 'La categoría es obligatoria.'
  } else if (!Number.isInteger(categoryId) || categoryId <= 0) {
    errors.category_id = 'Selecciona una categoría válida.'
  }

  return errors
}

export function validateCategory(input: CategoryFormInput): FormErrors {
  const errors: FormErrors = {}
  const name = input.name.trim()

  if (!name) {
    errors.name = 'El nombre es obligatorio.'
  } else if (name.length > 120) {
    errors.name = 'El nombre no puede superar los 120 caracteres.'
  }

  if (input.description.trim().length > 2000) {
    errors.description = 'La descripción no puede superar los 2000 caracteres.'
  }

  return errors
}
