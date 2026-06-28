// lib/pwned-password.ts

export async function isPasswordPwned(password: string): Promise<boolean> {
  if (!password) return false;

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);

    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();

    const prefix = hashHex.slice(0, 5);
    const suffix = hashHex.slice(5);

    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
    );

    if (!response.ok) {
      return false;
    }

    const text = await response.text();

    const isPwned = text
      .split('\n')
      .some((line) => line.split(':')[0] === suffix);

    return isPwned;
  } catch (error) {
    console.error('Помилка перевірки пароля:', error);
    return false;
  }
}
