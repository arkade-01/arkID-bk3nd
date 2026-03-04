# Update Profile Endpoint — Frontend Implementation Guide

## Endpoint Summary

| | |
|---|---|
| **Method** | `PATCH` |
| **URL** | `/api/card/update` |
| **Auth** | `Authorization: Bearer <privy-token>` |
| **Body** | `multipart/form-data` |
| **All fields** | Optional — only send what changed |

---

## Request Fields

| Field | Type | Constraints |
|---|---|---|
| `display_name` | `string` | — |
| `bio` | `string` | Max 200 characters |
| `social_links` | JSON string | Array of link objects |
| `profile_photo` | `File` | Any image file |

### `social_links` Shape

```json
[
  { "platform": "twitter",  "url": "https://twitter.com/handle",       "visible": true, "order": 0 },
  { "platform": "linkedin", "url": "https://linkedin.com/in/handle",   "visible": true, "order": 1 },
  { "platform": "instagram","url": "https://instagram.com/handle",     "visible": false,"order": 2 }
]
```

---

## Implementation (React + TypeScript)

### 1. Types

```typescript
interface SocialLink {
  platform: string;
  url: string;
  visible: boolean;
  order: number;
}

interface UpdateProfileForm {
  display_name: string;
  bio: string;
  social_links: SocialLink[];
}

interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    card_id: string;
    user_id: string;
    username: string;
    display_name: string;
    bio: string;
    profile_photo: string;
    social_links: SocialLink[];
    isActivated: boolean;
  };
}
```

### 2. Form State

```typescript
const [form, setForm] = useState<UpdateProfileForm>({
  display_name: "",
  bio: "",
  social_links: [],
});
const [photoFile, setPhotoFile]     = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const [loading, setLoading]         = useState(false);
const [error, setError]             = useState<string | null>(null);
```

### 3. Image Input Handler (with Local Preview)

```typescript
const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setPhotoFile(file);

  // Show a local preview before the upload completes
  const reader = new FileReader();
  reader.onloadend = () => setPhotoPreview(reader.result as string);
  reader.readAsDataURL(file);
};
```

### 4. Build and Send the Request

```typescript
const updateProfile = async (): Promise<UpdateProfileResponse> => {
  const formData = new FormData();

  if (form.display_name) formData.append("display_name", form.display_name);
  if (form.bio)          formData.append("bio", form.bio);

  // social_links must be a JSON string — NOT a raw object
  formData.append("social_links", JSON.stringify(form.social_links));

  // File field name must match exactly "profile_photo"
  if (photoFile) formData.append("profile_photo", photoFile);

  const res = await fetch("/api/card/update", {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${privyToken}`,
      // ❌ Do NOT set Content-Type manually
      // The browser automatically sets multipart/form-data with the correct boundary
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message ?? "Update failed");
  }

  return data;
};
```

### 5. Full Form Component

```tsx
export function EditProfileForm({ privyToken, currentProfilePhoto }: {
  privyToken: string;
  currentProfilePhoto?: string;
}) {
  const [form, setForm] = useState<UpdateProfileForm>({
    display_name: "",
    bio: "",
    social_links: [],
  });
  const [photoFile, setPhotoFile]       = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      if (form.display_name) formData.append("display_name", form.display_name);
      if (form.bio)          formData.append("bio", form.bio);
      formData.append("social_links", JSON.stringify(form.social_links));
      if (photoFile)         formData.append("profile_photo", photoFile);

      const res = await fetch("/api/card/update", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${privyToken}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      console.log("Updated card:", data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">

      {/* Profile photo */}
      <div>
        <img
          src={photoPreview ?? currentProfilePhoto ?? "/default-avatar.png"}
          alt="Profile preview"
          width={100}
          height={100}
          style={{ borderRadius: "50%", objectFit: "cover" }}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Display name */}
      <input
        type="text"
        placeholder="Display name"
        value={form.display_name}
        onChange={(e) => setForm({ ...form, display_name: e.target.value })}
      />

      {/* Bio */}
      <textarea
        placeholder="Bio (max 200 characters)"
        maxLength={200}
        value={form.bio}
        onChange={(e) => setForm({ ...form, bio: e.target.value })}
      />
      <small>{form.bio.length}/200</small>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Profile"}
      </button>

    </form>
  );
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "card_id": "ark001",
    "user_id": "usr_abc123",
    "username": "johndoe",
    "display_name": "John Doe",
    "bio": "Software developer based in Lagos",
    "profile_photo": "https://ik.imagekit.io/xxx/profile-photos/photo_unique.jpg",
    "social_links": [
      { "platform": "twitter", "url": "https://twitter.com/johndoe", "visible": true, "order": 0 }
    ],
    "isActivated": true
  }
}
```

## Error Responses

| Status | Message |
|---|---|
| `400` | `"Bio must be 200 characters or less"` |
| `401` | `"No authorization token provided"` |
| `401` | `"Token verification failed"` |
| `404` | `"Card not found for this user"` |
| `500` | `"Failed to update profile"` |

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| Setting `Content-Type: application/json` | Remove it — browser sets `multipart/form-data` with boundary automatically |
| Passing `social_links` as an object | Always `JSON.stringify()` it before appending to `FormData` |
| Wrong file field name | Must be exactly `"profile_photo"` to match the multer middleware |
| Sending a JSON body | Even with no file, use `FormData` — the multer middleware expects it |
