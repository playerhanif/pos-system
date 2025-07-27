"use client"

export interface UploadedImage {
  id: string
  name: string
  url: string
  size: number
  type: string
  uploadedAt: Date
}

export class ImageUploadService {
  private static instance: ImageUploadService
  private uploadedImages: Map<string, UploadedImage> = new Map()

  private constructor() {
    this.loadImagesFromStorage()
  }

  public static getInstance(): ImageUploadService {
    if (!ImageUploadService.instance) {
      ImageUploadService.instance = new ImageUploadService()
    }
    return ImageUploadService.instance
  }

  private loadImagesFromStorage(): void {
    const saved = localStorage.getItem("pos-uploaded-images")
    if (saved) {
      try {
        const images = JSON.parse(saved)
        this.uploadedImages = new Map(
          images.map((img: any) => [
            img.id,
            {
              ...img,
              uploadedAt: new Date(img.uploadedAt),
            },
          ]),
        )
      } catch (error) {
        console.warn("Error loading uploaded images:", error)
      }
    }
  }

  private saveImagesToStorage(): void {
    const images = Array.from(this.uploadedImages.values())
    localStorage.setItem("pos-uploaded-images", JSON.stringify(images))
  }

  public async uploadImage(file: File): Promise<UploadedImage> {
    return new Promise((resolve, reject) => {
      // Validate file
      if (!file.type.startsWith("image/")) {
        reject(new Error("File must be an image"))
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        reject(new Error("Image size must be less than 5MB"))
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          const uploadedImage: UploadedImage = {
            id: Date.now().toString(),
            name: file.name,
            url: result,
            size: file.size,
            type: file.type,
            uploadedAt: new Date(),
          }

          this.uploadedImages.set(uploadedImage.id, uploadedImage)
          this.saveImagesToStorage()
          resolve(uploadedImage)
        } else {
          reject(new Error("Failed to read file"))
        }
      }

      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }

      reader.readAsDataURL(file)
    })
  }

  public getImage(id: string): UploadedImage | undefined {
    return this.uploadedImages.get(id)
  }

  public getAllImages(): UploadedImage[] {
    return Array.from(this.uploadedImages.values()).sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
  }

  public deleteImage(id: string): boolean {
    const deleted = this.uploadedImages.delete(id)
    if (deleted) {
      this.saveImagesToStorage()
    }
    return deleted
  }

  public getImageUrl(id: string): string {
    const image = this.uploadedImages.get(id)
    return image?.url || "/placeholder.svg?height=120&width=120&text=🍽️"
  }
}

// Utility functions
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function isValidImageType(type: string): boolean {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  return validTypes.includes(type.toLowerCase())
}
