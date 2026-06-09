#!/bin/bash

# Build & Deploy Script for Ordering System App

echo "🚀 Ordering System App - Build & Deploy"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}➜${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Step 1: Check prerequisites
print_status "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Please install Node.js v16+"
    exit 1
fi
print_success "Node.js installed: $(node --version)"

if ! command -v npm &> /dev/null; then
    print_warning "npm not found"
    exit 1
fi
print_success "npm installed: $(npm --version)"

# Step 2: Install dependencies
print_status "Installing dependencies..."
npm install
print_success "Dependencies installed"

# Step 3: Fix Expo compatibility
print_status "Fixing Expo compatibility issues..."
npx expo install --fix
print_success "Expo dependencies fixed"

# Step 4: Install EAS CLI
print_status "Installing EAS CLI..."
npm install -g eas-cli
print_success "EAS CLI installed"

# Step 5: Build options
print_status "Select build target:"
echo "1) Android APK"
echo "2) Android App Bundle (Play Store)"
echo "3) iOS"
echo "4) Web"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        print_status "Building Android APK..."
        npx eas build --platform android --type apk
        ;;
    2)
        print_status "Building Android App Bundle..."
        npx eas build --platform android --type app-bundle
        ;;
    3)
        print_status "Building iOS app..."
        npx eas build --platform ios
        ;;
    4)
        print_status "Building for Web..."
        npm run web
        ;;
    *)
        print_warning "Invalid choice"
        exit 1
        ;;
esac

print_success "Build completed!"
