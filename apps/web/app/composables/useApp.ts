export function isDarkBg() {
  const DARKPAGE = [ HOME ]
  return DARKPAGE.includes(useRoute().name as string) ? true : false
}
