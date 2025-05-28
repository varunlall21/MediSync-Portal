
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreHorizontal, UserPlus, Search, Filter, Trash2, Edit3, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from '@/contexts/auth-context';
import { Card } from '@/components/ui/card';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  status: "Active" | "Invited" | "Disabled";
}

const mockUsers: User[] = [
  { id: "1", name: "Alice Johnson (Admin)", email: "admin@example.com", role: "admin", createdAt: "2023-01-15", status: "Active" },
  { id: "2", name: "Dr. Bob Smith (Doctor)", email: "doctor.bob@example.com", role: "doctor", createdAt: "2023-02-20", status: "Active" },
  { id: "3", name: "Charlie Brown (Patient)", email: "patient.charlie@example.com", role: "patient", createdAt: "2023-03-10", status: "Invited" },
  { id: "4", name: "Dr. Diana Prince (Doctor)", email: "doctor.diana@example.com", role: "doctor", createdAt: "2023-04-05", status: "Active" },
  { id: "5", name: "Eve Adams (Patient)", email: "patient.eve@example.com", role: "patient", createdAt: "2023-05-22", status: "Disabled" },
];


export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("patient");

  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'add' || searchParams.get('add') === 'true') {
      setIsAddUserDialogOpen(true);
    }
  }, [searchParams]);


  const handleAddUser = () => {
    const newUser: User = {
      id: String(users.length + 1),
      name: `New User ${users.length + 1}`, // Placeholder name
      email: newUserEmail,
      role: newUserRole,
      createdAt: new Date().toISOString().split('T')[0],
      status: "Invited",
    };
    setUsers([...users, newUser]);
    setNewUserEmail("");
    setNewUserRole("patient");
    setIsAddUserDialogOpen(false);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const getRoleBadgeVariant = (role: UserRole) => {
    switch(role) {
      case 'admin': return 'destructive';
      case 'doctor': return 'secondary';
      case 'patient': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add New User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Enter the details for the new user. They will receive an invitation email.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="col-span-3" placeholder="user@example.com" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select value={newUserRole || ""} onValueChange={(value) => setNewUserRole(value as UserRole)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleAddUser}>Add User</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search users by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      <Card className="shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">{user.role}</Badge>
                </TableCell>
                <TableCell>{user.createdAt}</TableCell>
                <TableCell>
                   <Badge variant={user.status === 'Active' ? 'default' : user.status === 'Invited' ? 'outline' : 'secondary'}
                    className={`${user.status === 'Active' ? 'bg-green-500/80 hover:bg-green-600/80' : user.status === 'Invited' ? 'border-yellow-500 text-yellow-400' : 'bg-slate-500/80 hover:bg-slate-600/80'} text-white`}>
                    {user.status}
                   </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem><Edit3 className="mr-2 h-4 w-4" /> Edit User</DropdownMenuItem>
                      <DropdownMenuItem><ShieldCheck className="mr-2 h-4 w-4" /> Change Role</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredUsers.length === 0 && (
          <div className="p-6 text-center text-muted-foreground">No users found.</div>
        )}
      </Card>
    </div>
  );
}
