import { get, set, del, keys } from 'idb-keyval';
import { CourseMaterial } from '../types';

const MATERIALS_LIST_KEY = 'uottawa_materials_list_v1';

export class CourseMaterialsService {
  /**
   * Get the list of all materials (metadata only)
   */
  static async getMaterials(): Promise<CourseMaterial[]> {
    try {
      const raw = localStorage.getItem(MATERIALS_LIST_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load materials list', err);
    }
    return [];
  }

  static async saveMaterialsList(materials: CourseMaterial[]): Promise<void> {
    localStorage.setItem(MATERIALS_LIST_KEY, JSON.stringify(materials));
  }

  /**
   * Save a new PDF/material to IndexedDB and update the list
   */
  static async addMaterial(
    courseId: string,
    title: string,
    type: 'pdf' | 'slideshow' | 'link',
    fileBlob?: Blob,
    linkUrl?: string
  ): Promise<CourseMaterial> {
    const id = `mat-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();

    let url = linkUrl || '';

    if (fileBlob) {
      // Store blob in IndexedDB
      await set(`blob-${id}`, fileBlob);
      url = `idb://${id}`; // Custom scheme to know it's in IDB
    }

    const material: CourseMaterial = {
      id,
      courseId,
      title,
      type,
      url,
      createdAt: now,
    };

    const list = await this.getMaterials();
    list.push(material);
    await this.saveMaterialsList(list);

    return material;
  }

  /**
   * Get the actual Blob for a material
   */
  static async getMaterialBlob(id: string): Promise<Blob | null> {
    const blob = await get(`blob-${id}`);
    return blob || null;
  }

  /**
   * Delete a material
   */
  static async deleteMaterial(id: string): Promise<void> {
    const list = await this.getMaterials();
    const filtered = list.filter((m) => m.id !== id);
    await this.saveMaterialsList(filtered);
    await del(`blob-${id}`);
  }
}
