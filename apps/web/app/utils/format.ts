export const formatService = (value: string) =>
  value
    .split('-')
    .map((word) =>
      word === 'ux' || word === 'ui'
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(' ')
