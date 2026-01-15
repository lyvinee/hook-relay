import { PasswordHasher } from "@/password/passwordHasher.abstract";
import argon from "argon2";

export class ArgonPasswordHasher extends PasswordHasher {
  async hash(password: string): Promise<string> {
    const hash = await argon.hash(password);
    return hash;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    const verified = await argon.verify(hash, password);
    return verified;
  }
}
