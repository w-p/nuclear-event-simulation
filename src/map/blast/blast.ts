import { BlastZone } from './blast-zone';

// Blast
export class Blast {
  zones: BlastZone[] = [];
  fireballDuration: number = 0;

  constructor(kilometers: number) {
    const kilotons = this.kilometersToKilotons(kilometers);
    this.calculateBlast(kilotons);
  }

  kilometersToKilotons(kilometers: number): number {
    return Math.pow(kilometers / 1.42, 3.033);
  }

  private calculateBlast(kilotons: number) {
    this.fireballDuration = Math.pow(kilotons, 0.45) * 0.2;
    this.zones = [
      new BlastZone(1, 0.0, Math.pow(kilotons, 0.33) * 1.42),
      new BlastZone(3, 0.05, Math.pow(kilotons, 0.33) * 0.64),
      new BlastZone(5, 0.5, Math.pow(kilotons, 0.33) * 0.46),
      new BlastZone(10, 0.9, Math.pow(kilotons, 0.33) * 0.31),
      new BlastZone(20, 1.0, Math.pow(kilotons, 0.33) * 0.22),
    ];
  }
}
