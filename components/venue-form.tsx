"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useStore } from "@/lib/store"
import { VENUE_TYPES } from "@/lib/constants"
import type { Venue, VenueType } from "@/lib/types"
import { toast } from "sonner"

const venueSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  type: z.enum(["indoor", "outdoor", "hybrid"]),
  maxPopulation: z.coerce.number().min(1, "Must be at least 1"),
  ownerName: z.string().min(2, "Owner name required"),
  ownerContact: z.string().min(2, "Contact information required"),
  address: z.string().min(5, "Address required"),
})

type VenueFormData = z.infer<typeof venueSchema>

interface VenueFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  venue?: Venue
}

export function VenueFormDialog({ open, onOpenChange, venue }: VenueFormProps) {
  const { addVenue, updateVenue } = useStore()
  const isEditing = !!venue

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<VenueFormData>({
    resolver: zodResolver(venueSchema),
    defaultValues: venue
      ? {
          name: venue.name,
          type: venue.type,
          maxPopulation: venue.maxPopulation,
          ownerName: venue.ownerName,
          ownerContact: venue.ownerContact,
          address: venue.address,
        }
      : {
          name: "",
          type: "indoor",
          maxPopulation: 100,
          ownerName: "",
          ownerContact: "",
          address: "",
        },
  })

  const selectedType = watch("type")

  function onSubmit(data: VenueFormData) {
    if (isEditing && venue) {
      updateVenue({
        ...venue,
        ...data,
        type: data.type as VenueType,
      })
      toast.success("Venue updated successfully")
    } else {
      const newVenue: Venue = {
        id: `v${Date.now()}`,
        ...data,
        type: data.type as VenueType,
        createdAt: new Date().toISOString(),
      }
      addVenue(newVenue)
      toast.success("Venue added successfully")
    }
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Venue" : "Add New Venue"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update venue information below."
              : "Fill in the details to register a new venue."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Venue Name</Label>
            <Input id="name" {...register("name")} placeholder="Cape Town Stadium" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Type</Label>
              <Select
                value={selectedType}
                onValueChange={(val) => setValue("type", val as VenueType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VENUE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="maxPopulation">Max Capacity</Label>
              <Input
                id="maxPopulation"
                type="number"
                {...register("maxPopulation")}
              />
              {errors.maxPopulation && (
                <p className="text-xs text-destructive">
                  {errors.maxPopulation.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ownerName">Owner Name</Label>
            <Input id="ownerName" {...register("ownerName")} placeholder="City of Cape Town" />
            {errors.ownerName && (
              <p className="text-xs text-destructive">
                {errors.ownerName.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="ownerContact">Contact Info</Label>
            <Input
              id="ownerContact"
              {...register("ownerContact")}
              placeholder="events@capetown.gov.za"
            />
            {errors.ownerContact && (
              <p className="text-xs text-destructive">
                {errors.ownerContact.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              {...register("address")}
              placeholder="Fritz Sonnenberg Road, Green Point, Cape Town"
            />
            {errors.address && (
              <p className="text-xs text-destructive">
                {errors.address.message}
              </p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Venue" : "Add Venue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
