/**
 * 生年月日文字列（YYYY-MM-DD）から日本時間基準の年齢を返す
 * 境界日（誕生日当日）は加齢済みとして扱う
 */
export function calcAgeJST(birthdayStr: string): number {
  const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000)
  const todayYear  = nowJST.getUTCFullYear()
  const todayMonth = nowJST.getUTCMonth() + 1
  const todayDay   = nowJST.getUTCDate()

  const [birthYear, birthMonth, birthDay] = birthdayStr.split('-').map(Number)

  let age = todayYear - birthYear
  if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) {
    age--
  }
  return age
}
