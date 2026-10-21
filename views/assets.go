package views

import (
	"crypto/sha256"
	"encoding/hex"
	styleease "github.com/lorenzodarioben-lgtm/style-ease"
	"io/fs"
)

var versions = func() map[string]string {
	m := map[string]string{}
	_ = fs.WalkDir(styleease.Resources, "assets", func(path string, entry fs.DirEntry, err error) error {
		if err != nil || entry.IsDir() {
			return err
		}
		if b, e := styleease.Resources.ReadFile(path); e == nil {
			sum := sha256.Sum256(b)
			m["/"+path] = hex.EncodeToString(sum[:6])
		}
		return nil
	})
	return m
}()

func assetURL(path string) string {
	if v := versions[path]; v != "" {
		return path + "?v=" + v
	}
	return path
}
