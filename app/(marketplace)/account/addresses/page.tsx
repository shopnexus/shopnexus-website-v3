"use client"

import { useState } from "react"
import {
  useListContacts,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  AddressType,
  Contact,
} from "@/core/account/contact"
import { useGetMe, useUpdateMe } from "@/core/account/account"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Home,
  Briefcase,
  Loader2,
  Star,
  Phone,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function AddressesPage() {
  const { data: contacts, isLoading } = useListContacts()
  const { data: user } = useGetMe()
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const deleteContact = useDeleteContact()
  const updateMe = useUpdateMe()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address: "",
    address_type: "Home" as "Home" | "Work",
  })

  const openAddDialog = () => {
    setEditingContact(null)
    setFormData({ full_name: "", phone: "", address: "", address_type: "Home" })
    setIsDialogOpen(true)
  }

  const openEditDialog = (contact: Contact) => {
    setEditingContact(contact)
    setFormData({
      full_name: contact.full_name,
      phone: contact.phone,
      address: contact.address,
      address_type: contact.address_type === AddressType.Home ? "Home" : "Work",
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (editingContact) {
      await updateContact.mutateAsync({
        contact_id: editingContact.id,
        ...formData,
      })
    } else {
      await createContact.mutateAsync(formData)
    }
    setIsDialogOpen(false)
  }

  const handleDelete = async (id: string) => {
    await deleteContact.mutateAsync({ contact_id: id })
    setDeleteConfirm(null)
  }

  const handleSetDefault = async (contactId: string) => {
    await updateMe.mutateAsync({ default_contact_id: contactId })
  }

  const isSubmitting = createContact.isPending || updateContact.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Addresses</h1>
          <p className="text-muted-foreground">Manage your shipping addresses</p>
        </div>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Address
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-5 w-5" />
                </div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !contacts || contacts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No addresses yet</h3>
            <p className="text-muted-foreground mb-4">
              Add an address to make checkout faster.
            </p>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {contacts.map((contact) => {
            const isDefault = user?.default_contact_id === contact.id
            const Icon = contact.address_type === AddressType.Home ? Home : Briefcase

            return (
              <Card
                key={contact.id}
                className={cn(isDefault && "border-primary")}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Icon className="h-3 w-3" />
                        {contact.address_type === AddressType.Home ? "Home" : "Work"}
                      </Badge>
                      {isDefault && (
                        <Badge className="gap-1">
                          <Star className="h-3 w-3" />
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(contact)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteConfirm(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{contact.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{contact.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{contact.address}</span>
                    </div>
                  </div>

                  {!isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full"
                      onClick={() => handleSetDefault(contact.id)}
                      disabled={updateMe.isPending}
                    >
                      Set as Default
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Edit Address" : "Add New Address"}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Update your address details"
                : "Add a new shipping address"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="Enter full name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Enter full address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address_type">Address Type</Label>
              <Select
                value={formData.address_type}
                onValueChange={(value: "Home" | "Work") =>
                  setFormData({ ...formData, address_type: value })
                }
              >
                <SelectTrigger id="address_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : editingContact ? (
                "Save Changes"
              ) : (
                "Add Address"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Address</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this address? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteContact.isPending}
            >
              {deleteContact.isPending ? (
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
