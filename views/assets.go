package views

import (
	"crypto/sha256"
	"encoding/hex"
	styleease "github.com/lorenzodarioben-lgtm/style-ease"
)

var versions = func() map[string]string {
	m := map[string]string{}
	for _, path := range []string{"/assets/css/black-label.css", "/assets/js/storefront.js"} {
		if b, e := styleease.Resources.ReadFile(path[1:]); e == nil {
			sum := sha256.Sum256(b)
			m[path] = hex.EncodeToString(sum[:6])
		}
	}
	return m
}()

func assetURL(path string) string {
	if v := versions[path]; v != "" {
		return path + "?v=" + v
	}
	return path
}
