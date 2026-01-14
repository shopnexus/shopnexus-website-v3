"use client"

import { useState } from "react"
import { useListPromotionVendor, useCreateDiscount, useDeletePromotion, Promotion } from "@/core/promotion/promotion.vendor"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Tag,
  Calendar,
  Percent,
  DollarSign,
  Loader2,
  Copy,
} from "lucide-react"
import { formatPrice } from "@/lib/utils"

export default function VendorPromotionsPage() {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [deletePromotion, setDeletePromotion] = useState<Promotion | null>(null)

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    discount_percent: "",
    discount_price: "",
    min_spend: "0",
    max_discount: "",
    is_active: true,
    auto_apply: false,
    date_started: new Date().toISOString().split("T")[0],
    date_ended: "",
  })

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useListPromotionVendor({
    limit: 20,
    ...(activeTab !== "all" ? { is_active: activeTab === "active" } : {}),
  })
  const createMutation = useCreateDiscount()
  const deleteMutation = useDeletePromotion()

  const promotions = data?.pages.flatMap((page) => page.data) ?? []

  const filteredPromotions = promotions.filter((promo) =>
    promo.code.toLowerCase().includes(search.toLowerCase()) ||
    promo.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    await createMutation.mutateAsync({
      code: formData.code,
      title: formData.title,
      description: formData.description || null,
      is_active: formData.is_active,
      auto_apply: formData.auto_apply,
      date_started: new Date(formData.date_started).toISOString(),
      date_ended: formData.date_ended ? new Date(formData.date_ended).toISOString() : null,
      min_spend: parseFloat(formData.min_spend) || 0,
      max_discount: parseFloat(formData.max_discount) || 0,
      discount_percent: formData.discount_percent ? parseFloat(formData.discount_percent) : null,
      discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
      refs: [],
    })
    setIsCreateOpen(false)
    setFormData({
      code: "",
      title: "",
      description: "",
      discount_percent: "",
      discount_price: "",
      min_spend: "0",
      max_discount: "",
      is_active: true,
      auto_apply: false,
      date_started: new Date().toISOString().split("T")[0],
      date_ended: "",
    })
  }

  const handleDelete = async () => {
    if (!deletePromotion) return
    await deleteMutation.mutateAsync(deletePromotion.id)
    setDeletePromotion(null)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isExpired = (promo: Promotion) => {
    if (!promo.date_ended) return false
    return new Date(promo.date_ended) < new Date()
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Promotions</h1>
          <p className="text-muted-foreground">Create and manage discount codes</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Promotion
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by code or title..."
          className="pl-10 max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Promotions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPromotions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No promotions found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? "Try a different search term" : "Create your first promotion to attract customers"}
            </p>
            {!search && (
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Promotion
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredPromotions.map((promo) => (
            <Card key={promo.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono font-medium">
                          {promo.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(promo.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Badge variant={promo.is_active && !isExpired(promo) ? "default" : "secondary"}>
                        {isExpired(promo) ? "Expired" : promo.is_active ? "Active" : "Inactive"}
                      </Badge>
                      {promo.auto_apply && (
                        <Badge variant="outline">Auto-apply</Badge>
                      )}
                    </div>

                    <h3 className="font-medium">{promo.title}</h3>
                    {promo.description && (
                      <p className="text-sm text-muted-foreground">{promo.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(promo.date_started)}
                          {promo.date_ended && ` - ${formatDate(promo.date_ended)}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeletePromotion(promo)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Load More */}
          {hasNextPage && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Promotion Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Promotion</DialogTitle>
            <DialogDescription>
              Create a new discount code for your customers
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="SUMMER20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Summer Sale"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Get 20% off on all summer items"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_percent">Discount %</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="discount_percent"
                    type="number"
                    placeholder="20"
                    className="pl-10"
                    value={formData.discount_percent}
                    onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value, discount_price: "" })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_price">Or Fixed Amount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="discount_price"
                    type="number"
                    placeholder="10.00"
                    className="pl-10"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({ ...formData, discount_price: e.target.value, discount_percent: "" })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_spend">Min. Spend</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="min_spend"
                    type="number"
                    placeholder="0"
                    className="pl-10"
                    value={formData.min_spend}
                    onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_discount">Max. Discount</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="max_discount"
                    type="number"
                    placeholder="50"
                    className="pl-10"
                    value={formData.max_discount}
                    onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_started">Start Date</Label>
                <Input
                  id="date_started"
                  type="date"
                  value={formData.date_started}
                  onChange={(e) => setFormData({ ...formData, date_started: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_ended">End Date (optional)</Label>
                <Input
                  id="date_ended"
                  type="date"
                  value={formData.date_ended}
                  onChange={(e) => setFormData({ ...formData, date_ended: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">Enable this promotion</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Auto-apply</p>
                <p className="text-sm text-muted-foreground">Automatically apply at checkout</p>
              </div>
              <Switch
                checked={formData.auto_apply}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_apply: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !formData.code || !formData.title}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Promotion"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletePromotion} onOpenChange={() => setDeletePromotion(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Promotion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the promotion &quot;{deletePromotion?.code}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePromotion(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
