import { useEffect, useState, useMemo } from "react";
import petService from "@/services/petService";
import petTypeService from "@/services/petTypeService";
import { PencilSimple, Trash } from "phosphor-react";
import { toast } from "react-toastify";
import Pagination from "@/components/Layout/Pagination";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const ROWS_PER_PAGE = 10;

export default function PetProfileManagement({ user }) {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSpecies, setFilterSpecies] = useState("");
    const [filterGender, setFilterGender] = useState("");
    const [petTypes, setPetTypes] = useState([]);
    const [selectedPet, setSelectedPet] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        species: "",
        pet_type_id: "",
        breed: "",
        age: "",
        gender: "",
        weight: 0.0,
    });
    const [showForm, setShowForm] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [petToDelete, setPetToDelete] = useState(null);
    const [duplicatePet, setDuplicatePet] = useState(null);
    const [showDuplicateModal, setShowDuplicateModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // --- Normalize pet data ---
    const normalizePet = (pet) => {
        if (!pet) return pet;
        const type =
            petTypes.find((t) => t._id === pet.pet_type_id) ||
            petTypes.find((t) => t.name === pet.species);
        return {
            ...pet,
            pet_type_id: type?._id || pet.pet_type_id || "",
            species:
                typeof pet.species === "object"
                    ? pet.species.name
                    : type?.name || pet.species || "",
        };
    };

    // --- Load pets ---
    const loadPets = async () => {
        setLoading(true);
        try {
            let myPets = await petService.getMyPets();
            myPets = myPets.map(normalizePet);

            if (filterSpecies)
                myPets = myPets.filter((p) => p.species === filterSpecies);
            if (filterGender)
                myPets = myPets.filter((p) => p.gender === filterGender);
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                myPets = myPets.filter(
                    (p) =>
                        p.name.toLowerCase().includes(q) ||
                        (p.breed && p.breed.toLowerCase().includes(q)) ||
                        (p.species && p.species.toLowerCase().includes(q))
                );
            }

            setPets(myPets);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load pets!");
            setPets([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Load pet types ---
    const loadPetTypes = async () => {
        try {
            const types = await petTypeService.getAll();
            setPetTypes(types);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user) {
            loadPetTypes();
            loadPets();
        }
    }, [user, filterSpecies, filterGender]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(pets.length / ROWS_PER_PAGE));
    const startIndex = (currentPage - 1) * ROWS_PER_PAGE;
    const currentPets = useMemo(
        () => pets.slice(startIndex, startIndex + ROWS_PER_PAGE),
        [pets, startIndex]
    );

    // --- Form handlers ---
    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handlePetTypeChange = (e) => {
        const typeId = e.target.value;
        const type = petTypes.find((t) => t._id === typeId);
        setFormData({
            ...formData,
            pet_type_id: typeId,
            species: type ? type.name : "",
        });
    };

    const validateForm = () => {
        if (!formData.name.trim()) return "Name is required.";
        if (!formData.species) return "Species is required.";
        if (formData.age && formData.age < 0) return "Age must be >= 0.";
        if (formData.weight && formData.weight < 0) return "Weight must be >= 0.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errorMsg = validateForm();
        if (errorMsg) {
            toast.error(errorMsg);
            return;
        }

        const existingPet = pets.find(
            (p) =>
                p._id !== selectedPet?._id &&
                p.name.toLowerCase() === formData.name.toLowerCase() &&
                p.species === formData.species &&
                (p.breed || "") === (formData.breed || "")
        );

        if (existingPet) {
            setDuplicatePet(normalizePet(existingPet));
            setShowDuplicateModal(true);
            return;
        }

        await savePet();
    };

    const closeForm = () => {
        setShowForm(false);
        setSelectedPet(null);
        setFormData({
            name: "",
            species: "",
            pet_type_id: "",
            breed: "",
            age: "",
            gender: "",
            weight: 0,
        });
    };

    const handleEdit = (pet) => {
        const normalized = normalizePet(pet);
        setSelectedPet(normalized);
        setFormData({
            name: normalized.name || "",
            species: normalized.species || "",
            pet_type_id: normalized.pet_type_id || "",
            breed: normalized.breed || "",
            age: normalized.age || "",
            gender: normalized.gender || "",
            weight: normalized.weight || 0,
        });
        setShowForm(true);
    };

    const handleDelete = (pet) => {
        setPetToDelete(pet);
        setShowDelete(true);
    };

    const confirmDelete = async () => {
        if (!petToDelete) return;
        try {
            await petService.remove(petToDelete._id);
            toast.success("Pet deleted successfully!");
            setPets((prev) => prev.filter((p) => p._id !== petToDelete._id));
            setShowDelete(false);
            setPetToDelete(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete pet!");
        }
    };

    // ✅ Fixed version — ensure pet species name updates instantly
    const savePet = async (data = formData, petId = selectedPet?._id) => {
        try {
            const type = petTypes.find((t) => t._id === data.pet_type_id);
            const payload = {
                ...data,
                species: type ? type.name : data.species,
                user_id: user._id,
            };

            let res;
            if (petId) res = await petService.update(petId, payload);
            else res = await petService.create(payload);

            // ✅ Force species to show as name
            const normalized = normalizePet({
                ...res,
                species: type ? type.name : data.species,
            });

            setPets((prev) =>
                petId
                    ? prev.map((p) => (p._id === petId ? normalized : p))
                    : [...prev, normalized]
            );

            toast.success(petId ? "Pet updated successfully!" : "Pet added successfully!");
            closeForm();
        } catch (err) {
            console.error(err);
            toast.error("Failed to save pet!");
        }
    };

    const handleDuplicateOverwrite = async () => {
        if (!duplicatePet) return;
        try {
            const type = petTypes.find((t) => t._id === formData.pet_type_id);
            const payload = {
                ...formData,
                species: type ? type.name : formData.species,
            };

            let updatedPet = await petService.update(duplicatePet._id, payload);
            updatedPet = normalizePet({
                ...updatedPet,
                species: type ? type.name : formData.species,
            });

            setPets((prev) =>
                prev.map((p) => (p._id === duplicatePet._id ? updatedPet : p))
            );

            toast.success("Pet overwritten successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to overwrite pet!");
        } finally {
            setShowDuplicateModal(false);
            closeForm();
        }
    };

    if (!user) return <p>Loading user info...</p>;

    return (
        <div className="p-6 relative">
            <h1 className="text-2xl font-semibold mb-4">My Pet Profiles</h1>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
                <input
                    type="text"
                    placeholder="Search pets..."
                    className="border rounded px-2 py-1 flex-1"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                    className="border rounded px-2 py-1"
                    value={filterSpecies}
                    onChange={(e) => setFilterSpecies(e.target.value)}
                >
                    <option value="">All Species</option>
                    {petTypes.map((t) => (
                        <option key={t._id} value={t.name}>
                            {t.name}
                        </option>
                    ))}
                </select>
                <select
                    className="border rounded px-2 py-1"
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                >
                    <option value="">All Gender</option>
                    {GENDER_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                            {g}
                        </option>
                    ))}
                </select>
                <button
                    onClick={loadPets}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                    Apply
                </button>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                    Add Pet
                </button>
            </div>

            {/* Table */}
            <table className="w-full border border-gray-200 rounded">
                <thead>
                    <tr className="bg-gray-100 text-center">
                        <th className="border px-2 py-1">#</th>
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Species</th>
                        <th className="border px-2 py-1">Breed</th>
                        <th className="border px-2 py-1">Age</th>
                        <th className="border px-2 py-1">Gender</th>
                        <th className="border px-2 py-1">Weight</th>
                        <th className="border px-2 py-1">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={8} className="text-center p-4">
                                Loading pets...
                            </td>
                        </tr>
                    ) : currentPets.length === 0 ? (
                        <tr>
                            <td colSpan={8} className="text-center italic text-gray-500 p-4">
                                No pets found.
                            </td>
                        </tr>
                    ) : (
                        currentPets.map((pet, idx) => (
                            <tr key={pet._id} className="text-center">
                                <td className="border px-2 py-1">{startIndex + idx + 1}</td>
                                <td className="border px-2 py-1">{pet.name}</td>
                                <td className="border px-2 py-1">{pet.species}</td>
                                <td className="border px-2 py-1">{pet.breed}</td>
                                <td className="border px-2 py-1">{pet.age}</td>
                                <td className="border px-2 py-1">{pet.gender}</td>
                                <td className="border px-2 py-1">{pet.weight}</td>
                                <td className="border px-2 py-1 flex justify-center gap-2">
                                    <button
                                        onClick={() => handleEdit(pet)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <PencilSimple size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(pet)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="mt-3 flex justify-center">
                <Pagination
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Add/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-3xl">
                        <h2 className="text-3xl font-bold text-blue-600 text-left mb-6 border-b pb-2">
                            {selectedPet ? "Edit Pet" : "Add New Pet"}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-gray-400 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="border rounded px-3 py-2 w-full text-gray-800"
                                        placeholder="Enter pet name"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-400 mb-1">
                                        Species / Pet Type
                                    </label>
                                    <select
                                        name="pet_type_id"
                                        value={formData.pet_type_id}
                                        onChange={handlePetTypeChange}
                                        className="border rounded px-3 py-2 w-full text-gray-800"
                                    >
                                        <option value="">Select Species / Pet Type</option>
                                        {petTypes
                                            .filter((t) => t.is_active) // chỉ lấy type active
                                            .map((t) => (
                                                <option key={t._id} value={t._id}>
                                                    {t.name}
                                                </option>
                                            ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-400 mb-1">Breed</label>
                                    <input
                                        type="text"
                                        name="breed"
                                        value={formData.breed}
                                        onChange={handleChange}
                                        className="border rounded px-3 py-2 w-full text-gray-800"
                                        placeholder="Enter breed"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-gray-400 mb-1">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="border rounded px-3 py-2 w-full text-gray-800"
                                        min={0}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-400 mb-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="border rounded px-3 py-2 w-full text-gray-800"
                                    >
                                        <option value="">Select Gender</option>
                                        {GENDER_OPTIONS.map((g) => (
                                            <option key={g} value={g}>
                                                {g}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-gray-400 mb-1">Weight</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        className="border rounded px-3 py-2 w-full text-gray-800"
                                        min={0.0}
                                        placeholder="0.0"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-center gap-4 mt-4">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-6 py-2 rounded border"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {selectedPet ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDelete && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
                        <h2 className="text-3xl font-bold text-red-600 text-left mb-6 border-b pb-2">
                            Delete Pet
                        </h2>
                        <p className="mb-4 text-center">
                            Are you sure you want to delete "
                            {petToDelete?.name}"?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => setShowDelete(false)}
                                className="px-6 py-2 rounded border"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Duplicate Modal */}
            {showDuplicateModal && (
                <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
                        <h2 className="text-3xl font-bold text-orange-600 text-left mb-4 border-b pb-2">
                            Duplicate Pet Detected
                        </h2>

                        <p className="mb-4 text-center text-gray-700">
                            A pet with the same name, species, and breed already exists.<br />
                            Do you want to overwrite the existing record with the new data?
                        </p>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200 text-sm">
                                <thead className="bg-gray-100 text-gray-700">
                                    <tr>
                                        <th className="border px-3 py-2 text-left w-1/4">Field</th>
                                        <th className="border px-3 py-2 text-center w-1/3">Existing</th>
                                        <th className="border px-3 py-2 text-center w-1/3">New</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="border px-3 py-2 font-medium">Name</td>
                                        <td className="border px-3 py-2 text-center">{duplicatePet?.name || "-"}</td>
                                        <td className="border px-3 py-2 text-center">{formData.name || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-3 py-2 font-medium">Species</td>
                                        <td className="border px-3 py-2 text-center">
                                            {duplicatePet?.species || "-"}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {(formData.pet_type_id && petTypes.find(t => t._id === formData.pet_type_id)?.name)
                                                || formData.species || "-"}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="border px-3 py-2 font-medium">Breed</td>
                                        <td className="border px-3 py-2 text-center">{duplicatePet?.breed || "-"}</td>
                                        <td className="border px-3 py-2 text-center">{formData.breed || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-3 py-2 font-medium">Age</td>
                                        <td className="border px-3 py-2 text-center">{duplicatePet?.age ?? "-"}</td>
                                        <td className="border px-3 py-2 text-center">{formData.age ?? "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-3 py-2 font-medium">Gender</td>
                                        <td className="border px-3 py-2 text-center">{duplicatePet?.gender || "-"}</td>
                                        <td className="border px-3 py-2 text-center">{formData.gender || "-"}</td>
                                    </tr>
                                    <tr>
                                        <td className="border px-3 py-2 font-medium">Weight</td>
                                        <td className="border px-3 py-2 text-center">{duplicatePet?.weight ?? "-"}</td>
                                        <td className="border px-3 py-2 text-center">{formData.weight ?? "-"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-center gap-4">
                            <button
                                onClick={() => setShowDuplicateModal(false)}
                                className="px-6 py-2 rounded border"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDuplicateOverwrite}
                                className="px-6 py-2 rounded bg-orange-600 text-white hover:bg-orange-700"
                            >
                                Overwrite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
