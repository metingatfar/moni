import { releaseManager } from './ReleaseManager';

export class ReleaseDiagnostics {
  public getDiagnostics() {
    return releaseManager.getDiagnostics();
  }
}
export const releaseDiagnostics = new ReleaseDiagnostics();
export default releaseDiagnostics;
