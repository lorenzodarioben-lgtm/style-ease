package web

import (
	"context"
	"github.com/lorenzodarioben-lgtm/style-ease/internal/domain"
	"net/url"
	"strconv"
	"strings"
)

func (s *Server) studioPost(ctx context.Context, key, path string, f url.Values, products []domain.Product) error {
	if path == "/studio/save" {
		vs := []int{}
		for _, raw := range f["variant"] {
			if raw == "" {
				continue
			}
			v, e := strconv.Atoi(raw)
			if e != nil {
				return domain.ErrInvalid
			}
			vs = append(vs, v)
		}
		return s.DB.SaveLook(ctx, key, strings.TrimSpace(f.Get("name")), vs)
	}
	return s.DB.LookAction(ctx, key, f.Get("look"), strings.TrimPrefix(path, "/studio/"), strings.TrimSpace(f.Get("name")))
}
