<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Supplier::orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'    => 'required|string|max:255',
            'phone'   => 'nullable|string|max:50',
            'email'   => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        return response()->json(Supplier::create($data), 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json(Supplier::findOrFail($id));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $supplier = Supplier::findOrFail($id);

        $data = $request->validate([
            'name'    => 'sometimes|required|string|max:255',
            'phone'   => 'nullable|string|max:50',
            'email'   => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $supplier->update($data);

        return response()->json($supplier);
    }

    public function destroy(int $id): JsonResponse
    {
        Supplier::findOrFail($id)->delete();

        return response()->json(['message' => 'Fournisseur supprimé.']);
    }
}
