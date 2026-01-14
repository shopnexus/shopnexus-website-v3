"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useCreateProductSPU } from "@/core/catalog/product.vendor"
import { useListCategories } from "@/core/catalog/category"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  Loader2,
  ImagePlus,
  X,
  Plus,
  Package,
} from "lucide-react"

export default function NewProductPage() {
  const router = useRouter()
  const createProduct = useCreateProductSPU()
  const { data: categoriesData } = useListCategories({ limit: 100 })

  const categories = categoriesData?.pages.flatMap((page) => page.data) ?? []

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    brand_id: "",
    is_active: true,
    tags: [] as string[],
  })

  const [tagInput, setTagInput] = useState("")

  const [specifications, setSpecifications] = useState<Array<{ name: string; value: string }>>([])

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) })
  }

  const handleAddSpec = () => {
    setSpecifications([...specifications, { name: "", value: "" }])
  }

  const handleRemoveSpec = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await createProduct.mutateAsync({
      name: formData.name,
      description: formData.description,
      category_id: formData.category_id,
      brand_id: formData.brand_id || "default",
      is_active: formData.is_active,
      tags: formData.tags,
      specifications: specifications.filter((s) => s.name && s.value),
    })

    router.push("/vendor/products")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/vendor/products">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product listing</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the basic details of your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Describe your product..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  placeholder="Enter brand name"
                  value={formData.brand_id}
                  onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">
                  Make this product visible to customers
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Product Images</CardTitle>
            <CardDescription>Upload images of your product</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                type="button"
                className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-muted/50 transition-colors"
              >
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add Image</span>
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Recommended: 1000x1000px, max 5MB per image. First image will be the main product image.
            </p>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
            <CardDescription>Add tags to help customers find your product</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
            <CardDescription>Add product specifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {specifications.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Name (e.g., Material)"
                  value={spec.name}
                  onChange={(e) => {
                    const updated = [...specifications]
                    updated[index].name = e.target.value
                    setSpecifications(updated)
                  }}
                />
                <Input
                  placeholder="Value (e.g., Cotton)"
                  value={spec.value}
                  onChange={(e) => {
                    const updated = [...specifications]
                    updated[index].value = e.target.value
                    setSpecifications(updated)
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveSpec(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={handleAddSpec}>
              <Plus className="h-4 w-4 mr-2" />
              Add Specification
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/vendor/products">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={createProduct.isPending || !formData.name || !formData.category_id}
          >
            {createProduct.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Create Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
