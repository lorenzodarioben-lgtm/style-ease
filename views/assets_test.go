package views

import (
	"crypto/sha512"
	"encoding/base64"
	"encoding/json"
	styleease "github.com/lorenzodarioben-lgtm/style-ease"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
	"strings"
	"testing"
)

func TestEmbeddedAssetProvenance(t *testing.T) {
	htmx, e := styleease.Resources.ReadFile("assets/js/htmx-4.0.0.min.js")
	if e != nil {
		t.Fatal(e)
	}
	sum := sha512.Sum384(htmx)
	if base64.StdEncoding.EncodeToString(sum[:]) != "BvJpBiO8Kh31EqtJe5DRIeWrHWnCGkwytKs9NKFi86Hhw96dEqdEMzZDeK9iEGTc" {
		t.Fatal("vendored HTMX bytes differ from official 4.0.0 integrity")
	}
	b, _ := styleease.Resources.ReadFile("seeds/catalogue.json")
	var ps []domain.Product
	if e = json.Unmarshal(b, &ps); e != nil {
		t.Fatal(e)
	}
	for _, p := range ps {
		if _, e = styleease.Resources.ReadFile(strings.TrimPrefix(p.Image, "/")); e != nil {
			t.Fatal(p.Image, e)
		}
		if _, e = styleease.Resources.ReadFile(strings.TrimPrefix(imageSmall(p.Image), "/")); e != nil {
			t.Fatal(e)
		}
	}
	if !strings.Contains(assetURL("/assets/css/black-label.css"), "?v=") {
		t.Fatal("asset fingerprint absent")
	}
}
