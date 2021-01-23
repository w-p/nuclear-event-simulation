// Blast Zone
export class BlastZone {
  psi: number;
  radius: number;
  deathRate: number;
  constructor(psi: number, deathRate: number, radius: number) {
    this.psi = psi;
    this.deathRate = deathRate;
    this.radius = radius;
  }
}
