<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DepartmentController extends Controller
{
    private function validated(Request $request, ?Department $record = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:100', Rule::unique('departments', 'name')->ignore($record)],
        ]);
    }

    public function store(Request $request)
    {
        $record = Department::create($this->validated($request));
        AuditLog::record('department.created', $record);

        return redirect()->route('dashboard', ['page' => 'departments'])->with('success', 'Departemen berhasil ditambahkan.');
    }

    public function update(Request $request, Department $department)
    {
        $this->authorize('update', $department);
        $department->update($this->validated($request, $department));
        AuditLog::record('department.updated', $department);

        return redirect()->route('dashboard', ['page' => 'departments'])->with('success', 'Departemen berhasil diperbarui.');
    }

    public function destroy(Department $department)
    {
        $this->authorize('delete', $department);
        if (Category::where('department_id', $department->id)->exists()) {
            return back()->withErrors(['name' => 'Departemen masih digunakan dan belum bisa dihapus.']);
        }
        $department->delete();
        AuditLog::record('department.deleted', $department);

        return redirect()->route('dashboard', ['page' => 'departments'])->with('success', 'Departemen berhasil dihapus.');
    }
}
