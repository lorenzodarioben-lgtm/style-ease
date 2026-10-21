package styleease

import "embed"

// Resources contains the exact static assets, migrations and deterministic seed.
//
//go:embed assets migrations seeds
var Resources embed.FS
